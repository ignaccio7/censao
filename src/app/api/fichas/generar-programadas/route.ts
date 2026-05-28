// oxlint-disable consistent-type-imports
// oxlint-disable prefer-default-export
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { StateCita, TipoCita } from '@/lib/constants'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'
import { NextResponse } from 'next/server'

/**
 * POST /api/fichas/generar-programadas
 *
 * Convierte las citas PENDIENTE del turno actual en fichas reales del día.
 * Solo accesible por DOCTOR_FICHAS y ADMINISTRADOR.
 *
 * Lógica por tipo:
 *   - VACUNA    → estado ADMISION, disponibilidad_id null  (pasa por Enfermería)
 *   - CONTROL/CONSULTA → estado EN_ESPERA, disponibilidad_id del doctor  (directo al médico)
 *
 * orden_turno: números negativos secuenciales (-1, -2, -3…) sin colisionar con presenciales.
 * Idempotente: citas en estado GENERADA se omiten silenciosamente.
 */
export async function POST(): Promise<NextResponse> {
  // ── 1. Validar permiso RBAC ──────────────────────────────────────────────
  const validation = await AuthService.validateApiPermission(
    '/api/fichas/generar-programadas',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userId = validation.data?.id ?? ''

  // ── 2. Validar turno actual ──────────────────────────────────────────────
  const turno = await getTurnoActual()
  if (!turno) {
    return NextResponse.json(
      {
        success: false,
        message: 'No es posible generar fichas fuera del horario de atención'
      },
      { status: 400 }
    )
  }

  const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()

  // ── 3. Buscar citas candidatas ───────────────────────────────────────────
  // Citas PENDIENTE de HOY en el turno actual
  const citasCandidatas = await prisma.citas.findMany({
    where: {
      estado: StateCita.PENDIENTE,
      turno_codigo: turno,
      fecha_programada: {
        gte: inicioUTC,
        lte: finUTC
      },
      eliminado_en: null
    },
    orderBy: {
      creado_en: 'asc'
    },
    include: {
      pacientes: {
        include: {
          personas: {
            select: { nombres: true, paterno: true }
          }
        }
      },
      doctores: true
    }
  })

  if (citasCandidatas.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No hay citas pendientes para el turno actual',
      generadas: 0,
      omitidas: 0,
      fichas: []
    })
  }

  // ── 4. Calcular siguiente orden_turno negativo ───────────────────────────
  // Busca el mínimo actual para continuar la secuencia sin colisiones
  const minOrden = await prisma.fichas.aggregate({
    where: {
      fecha_ficha: { gte: inicioUTC, lte: finUTC },
      turno_codigo: turno,
      orden_turno: { lt: 0 },
      eliminado_en: null
    },
    _min: { orden_turno: true }
  })

  // Si ya existe -3, el siguiente es -4; si no hay ninguno, empieza en -1
  let siguienteOrdenNegativo = (minOrden._min.orden_turno ?? 0) - 1

  // ── 5. Contar fichas activas para el mensaje de notificación ─────────────
  const fichasActivasCount = await prisma.fichas.count({
    where: {
      fecha_ficha: { gte: inicioUTC, lte: finUTC },
      turno_codigo: turno,
      estado: { in: ['ADMISION', 'ENFERMERIA', 'EN_ESPERA'] },
      eliminado_en: null
    }
  })

  // ── 6. Procesar cada cita en transacción ─────────────────────────────────
  const fichasGeneradas: Array<{
    ficha_id: string
    orden_turno: number
    tipo_cita: string
    paciente_id: string
  }> = []
  const citasOmitidas: string[] = []

  for (const cita of citasCandidatas) {
    // Idempotencia: si ya fue procesada, omitir
    if (cita.estado === StateCita.GENERADA) {
      citasOmitidas.push(cita.id)
      continue
    }

    // Determinar estado y disponibilidad según tipo de cita
    let estadoFicha: 'ADMISION' | 'EN_ESPERA' = 'ADMISION'
    let disponibilidadId: string | null = null

    if (cita.tipo === TipoCita.CONTROL || cita.tipo === TipoCita.CONSULTA) {
      // Buscar disponibilidad del doctor para el turno actual
      // Un doctor atiende una sola especialidad por turno → 0 o 1 resultado
      const disponibilidad = await prisma.disponibilidades.findFirst({
        where: {
          turno_codigo: turno,
          estado: true,
          doctores_especialidades: {
            doctor_id: cita.doctor_id
          }
        }
      })

      if (!disponibilidad) {
        // El doctor no tiene disponibilidad en este turno → omitir con warning
        citasOmitidas.push(cita.id)
        console.warn(
          `[generar-programadas] Cita ${cita.id}: doctor ${cita.doctor_id} sin disponibilidad en turno ${turno}. Se omite.`
        )
        continue
      }

      estadoFicha = 'EN_ESPERA'
      disponibilidadId = disponibilidad.id
    }
    // Para VACUNA: estado=ADMISION, disponibilidadId=null (ya son los defaults)

    const ordenActual = siguienteOrdenNegativo

    try {
      // Transacción: crear ficha + actualizar cita + crear notificación
      const nuevaFicha = await prisma.$transaction(async tx => {
        // a) Crear la ficha
        const ficha = await tx.fichas.create({
          data: {
            paciente_id: cita.paciente_id,
            disponibilidad_id: disponibilidadId,
            turno_codigo: turno,
            fecha_ficha: new Date(),
            estado: estadoFicha as any,
            orden_turno: ordenActual,
            cita_origen_id: cita.id,
            creado_por: userId
          }
        })

        // b) Marcar la cita como GENERADA
        await tx.citas.update({
          where: { id: cita.id },
          data: {
            estado: StateCita.GENERADA,
            actualizado_por: userId
          }
        })

        // c) Crear notificación interna para el paciente
        const nroPacientesDelante = fichasActivasCount
        const nroFicha = Math.abs(ordenActual)
        const turnoLabel = turno === 'AM' ? 'Mañana' : 'Tarde'

        await tx.notificaciones.create({
          data: {
            paciente_id: cita.paciente_id,
            cita_id: cita.id,
            titulo: `Tu ficha ha sido generada — Turno ${turnoLabel}`,
            mensaje: `N° ficha: #${nroFicha}. Hay aproximadamente ${nroPacientesDelante} paciente(s) antes que tú. Ve la pantalla de atención en: /atencion`,
            medio: 'SISTEMA',
            leido: false,
            fecha_envio: new Date(),
            creado_por: userId
          }
        })

        return ficha
      })

      fichasGeneradas.push({
        ficha_id: nuevaFicha.id,
        orden_turno: ordenActual,
        tipo_cita: cita.tipo,
        paciente_id: cita.paciente_id
      })

      // Solo decrementar si la ficha fue creada exitosamente
      siguienteOrdenNegativo -= 1
    } catch (error) {
      console.error(
        `[generar-programadas] Error al procesar cita ${cita.id}:`,
        error
      )
      citasOmitidas.push(cita.id)
    }
  }

  // ── 7. Respuesta ─────────────────────────────────────────────────────────
  const turnoLabel = turno === 'AM' ? 'Mañana' : 'Tarde'
  const hayOmitidas = citasOmitidas.length > 0

  return NextResponse.json(
    {
      success: true,
      message: `Se generaron ${fichasGeneradas.length} ficha(s) para el turno ${turnoLabel}${hayOmitidas ? `. ${citasOmitidas.length} cita(s) omitidas (sin disponibilidad o ya generadas).` : ''}`,
      generadas: fichasGeneradas.length,
      omitidas: citasOmitidas.length,
      fichas: fichasGeneradas
    },
    { status: 201 }
  )
}
