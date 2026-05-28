// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { tratamientoBatchCreateSchema } from '@/app/dashboard/tratamientos/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { StateTreatment, StateTreatmentType } from '@/lib/constants'

/**
 * POST /api/tratamientos/batch
 * Registra N tratamientos + citas opcionales en UNA sola transacción.
 * Ahora vinculado directamente al paciente (sin ficha).
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}

  try {
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = tratamientoBatchCreateSchema.safeParse(body)
    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      return NextResponse.json(
        {
          success: false,
          message: 'Error de validación',
          errors
        },
        { status: 400 }
      )
    }

    const validData = validationResult.data
    const pacienteCi = validData.pacienteId

    // ══════════════════════════════════════════════════════════════════════
    // TRANSACCIÓN: todo o nada
    // ══════════════════════════════════════════════════════════════════════
    const result = await prisma.$transaction(async tx => {
      // 1. Buscar el paciente
      const paciente = await tx.pacientes.findUnique({
        where: { paciente_id: pacienteCi },
        include: { personas: true }
      })

      if (!paciente) {
        throw new Error('PACIENTE_NOT_FOUND')
      }

      const persona = paciente.personas

      // 2. Verificar/crear usuario del paciente
      let usuarioCreado = false
      const usuarioExistente = await tx.usuarios.findFirst({
        where: { persona_ci: pacienteCi }
      })

      if (!usuarioExistente) {
        console.log(`[BATCH] Creando usuario para paciente CI: ${pacienteCi}`)

        const passwordHash = await bcrypt.hash(pacienteCi, 10)

        const rolPaciente = await tx.roles.findUnique({
          where: { nombre: 'PACIENTE' }
        })

        if (!rolPaciente) {
          throw new Error('ROL_PACIENTE_NOT_FOUND')
        }

        const nuevoUsuario = await tx.usuarios.create({
          data: {
            persona_ci: pacienteCi,
            username: pacienteCi,
            password_hash: passwordHash,
            activo: true,
            creado_por: userId
          }
        })

        await tx.usuarios_roles.create({
          data: {
            usuario_id: nuevoUsuario.usuario_id,
            rol_id: rolPaciente.id,
            desde: new Date()
          }
        })

        usuarioCreado = true
        console.log(
          `[BATCH] Usuario creado: ${pacienteCi} para ${persona.nombres} ${persona.paterno}`
        )
      }

      // 3. Procesar cada tratamiento
      const tratamientosCreados = []
      let citasCreadas = 0

      // Buscar el doctor asociado al usuario actual (Enfermería)
      let doctorAsignadoId = null

      const usuarioActual = await tx.usuarios.findUnique({
        where: { usuario_id: userId },
        select: { persona_ci: true }
      })

      if (usuarioActual?.persona_ci) {
        const doctorAsociado = await tx.doctores.findUnique({
          where: { doctor_id: usuarioActual.persona_ci }
        })
        if (doctorAsociado) {
          doctorAsignadoId = doctorAsociado.doctor_id
        }
      }

      // Fallback a un doctor genérico si el usuario actual no está registrado como doctor
      if (!doctorAsignadoId) {
        const doctorGenerico = await tx.doctores.findFirst({
          where: { eliminado_en: null }
        })
        if (doctorGenerico) {
          doctorAsignadoId = doctorGenerico.doctor_id
        }
      }

      for (const item of validData.tratamientos) {
        // 3.1 Verificar esquema de dosis
        const esquemaDosis = await tx.esquema_dosis.findUnique({
          where: { id: item.esquemaId },
          include: {
            vacunas: { select: { nombre: true, id: true } }
          }
        })

        if (!esquemaDosis) {
          throw new Error(`ESQUEMA_NOT_FOUND:${item.esquemaId}`)
        }

        // 3.2 Lógica de estado del tratamiento
        const esquemaActual = await tx.esquema_dosis.findUnique({
          where: { id: item.esquemaId },
          select: { vacuna_id: true, numero: true }
        })

        const todosEsquemasVacuna = await tx.esquema_dosis.findMany({
          where: { vacuna_id: esquemaActual!.vacuna_id },
          orderBy: { numero: 'asc' },
          select: { id: true, numero: true }
        })

        const totalDosis = todosEsquemasVacuna.length
        const esUltimaDosis = esquemaActual!.numero === totalDosis

        // Buscar tratamientos anteriores de esta vacuna para este paciente
        const tratamientosAnteriores = await tx.tratamientos.findMany({
          where: {
            eliminado_en: null,
            paciente_id: pacienteCi,
            esquema_dosis: { vacuna_id: esquemaActual!.vacuna_id }
          },
          include: {
            esquema_dosis: { select: { numero: true } }
          },
          orderBy: { fecha_aplicacion: 'asc' }
        })

        // ── Lógica de Estado y Reinicio ──
        const ultimoTratamientoGlobal = tratamientosAnteriores.at(-1)

        let esReinicio = false
        if (ultimoTratamientoGlobal) {
          esReinicio =
            esquemaActual!.numero <=
            ultimoTratamientoGlobal.esquema_dosis.numero
        }

        let estadoNuevoTratamiento: StateTreatmentType = StateTreatment.EN_CURSO

        if (esReinicio && ultimoTratamientoGlobal) {
          // Si es reinicio, marcamos el último tratamiento del ciclo anterior como INCOMPLETO
          await tx.tratamientos.update({
            where: { id: ultimoTratamientoGlobal.id },
            data: {
              estado: 'INCOMPLETA',
              actualizado_por: userId,
              actualizado_en: new Date()
            }
          })
        } else if (esUltimaDosis) {
          const numerosAplicados = new Set(
            tratamientosAnteriores
              .filter(t => t.estado === StateTreatment.EN_CURSO)
              .map(t => t.esquema_dosis.numero)
          )

          const todasLasAnterioresAplicadas = todosEsquemasVacuna
            .filter(e => e.numero < esquemaActual!.numero)
            .every(e => numerosAplicados.has(e.numero))

          estadoNuevoTratamiento = todasLasAnterioresAplicadas
            ? StateTreatment.COMPLETADA
            : StateTreatment.EN_CURSO
        }

        // Cancelar o absorber citas pendientes del tratamiento anterior
        if (ultimoTratamientoGlobal) {
          const estadoCita = esReinicio ? 'CANCELADA' : 'ABSORBIDA'
          await tx.citas.updateMany({
            where: {
              tratamiento_id: ultimoTratamientoGlobal.id,
              estado: 'PENDIENTE',
              eliminado_en: null
            },
            data: {
              estado: estadoCita,
              actualizado_por: userId,
              actualizado_en: new Date()
            }
          })
          console.log(
            `[BATCH] Citas PENDIENTE del tratamiento anterior ${ultimoTratamientoGlobal.id} marcadas como ${estadoCita}`
          )
        }

        // 3.3 Crear el tratamiento
        const tratamiento = await tx.tratamientos.create({
          data: {
            paciente_id: pacienteCi,
            esquema_id: item.esquemaId,
            estado: estadoNuevoTratamiento,
            observaciones: item.observaciones || null,
            fecha_aplicacion: new Date(),
            creado_por: userId
          }
        })

        // 3.4 Crear cita si fue incluida
        if (item.cita && doctorAsignadoId) {
          await tx.citas.create({
            data: {
              paciente_id: pacienteCi,
              doctor_id: doctorAsignadoId,
              tratamiento_id: tratamiento.id,
              fecha_programada: new Date(item.cita.fechaProgramada),
              tipo: item.cita.tipo,
              turno_codigo: item.cita.turnoCodigo,
              estado: 'PENDIENTE',
              observaciones: item.cita.observaciones || null,
              creado_por: userId
            }
          })
          citasCreadas++
          console.log(
            `[BATCH] Cita creada para ${pacienteCi} — ${item.cita.tipo} (${item.cita.turnoCodigo}) el ${item.cita.fechaProgramada}`
          )
        }

        tratamientosCreados.push({
          id: tratamiento.id,
          vacuna: esquemaDosis.vacunas.nombre,
          dosis: item.dosisNumero,
          estado: estadoNuevoTratamiento
        })
      }

      // Marcar ficha como ATENDIDA si venimos de una ficha programada
      if (validData.fichaOrigenId) {
        await tx.fichas.update({
          where: { id: validData.fichaOrigenId },
          data: {
            estado: 'ATENDIDA',
            actualizado_en: new Date(),
            actualizado_por: userId
          }
        })
      }

      return {
        tratamientosCreados,
        citasCreadas,
        usuarioCreado,
        paciente: `${persona.nombres} ${persona.paterno} ${persona.materno}`
      }
    })

    // ══════════════════════════════════════════════════════════════════════

    const nombresVacunas = result.tratamientosCreados
      .map(t => `${t.vacuna} (D${t.dosis})`)
      .join(', ')

    return NextResponse.json(
      {
        success: true,
        message: `${result.tratamientosCreados.length} tratamiento(s) registrado(s): ${nombresVacunas}${result.citasCreadas > 0 ? ` · ${result.citasCreadas} cita(s) programada(s)` : ''}`,
        data: {
          tratamientos: result.tratamientosCreados,
          citas_creadas: result.citasCreadas,
          usuario_creado: result.usuarioCreado,
          paciente: result.paciente
        }
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[BATCH] Error creating tratamientos:', error)

    // Errores controlados
    if (error.message === 'PACIENTE_NOT_FOUND') {
      return NextResponse.json(
        { success: false, message: 'Paciente no encontrado' },
        { status: 404 }
      )
    }
    if (error.message === 'ROL_PACIENTE_NOT_FOUND') {
      return NextResponse.json(
        {
          success: false,
          message: 'Rol PACIENTE no encontrado en el sistema'
        },
        { status: 500 }
      )
    }
    if (error.message?.startsWith('ESQUEMA_NOT_FOUND')) {
      return NextResponse.json(
        { success: false, message: 'Esquema de dosis no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
