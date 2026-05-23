// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { tratamientoCreateSchema } from '@/app/dashboard/tratamientos/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { z } from 'zod'
import { Roles } from '@/app/api/lib/constants'
import { StateTreatment, StateTreatmentType } from '@/lib/constants'
import { NextResponse, NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

// LISTAR TRATAMIENTOS (ENFERMERIA o ADMIN)
export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userRole = validation.data?.role

  try {
    // Filtro base: tratamientos no eliminados
    const whereClause: any = {
      eliminado_en: null
    }

    // Enfermería ve todos los tratamientos no eliminados
    if (userRole === Roles.ENFERMERIA) {
      // El filtro base eliminado_en: null ya cubre esto
    }

    const tratamientos = await prisma.tratamientos.findMany({
      where: whereClause,
      orderBy: { creado_en: 'desc' },
      select: {
        id: true,
        estado: true,
        observaciones: true,
        fecha_aplicacion: true,
        creado_en: true,
        paciente_id: true,
        esquema_dosis: {
          select: {
            numero: true,
            notas: true,
            vacunas: {
              select: {
                nombre: true,
                fabricante: true
              }
            }
          }
        },
        pacientes: {
          select: {
            paciente_id: true,
            personas: {
              select: {
                nombres: true,
                paterno: true,
                materno: true
              }
            }
          }
        }
      }
    })

    const tratamientosDto = tratamientos.map(t => {
      const persona = t.pacientes.personas
      const fechaAplicacion = new Date(t.fecha_aplicacion).toLocaleDateString(
        'es-BO',
        {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      )

      return {
        id: t.id,
        paciente_nombre:
          `${persona.nombres} ${persona.paterno} ${persona.materno}`.trim(),
        paciente_ci: t.pacientes.paciente_id,
        vacuna_nombre: t.esquema_dosis.vacunas.nombre,
        vacuna_fabricante: t.esquema_dosis.vacunas.fabricante,
        dosis_numero: t.esquema_dosis.numero,
        dosis_notas: t.esquema_dosis.notas,
        estado: t.estado,
        observaciones: t.observaciones,
        fecha_aplicacion: fechaAplicacion
      }
    })

    return NextResponse.json({ success: true, data: tratamientosDto })
  } catch (error) {
    console.error('Error al obtener tratamientos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// REGISTRAR UN NUEVO TRATAMIENTO
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
    const validationResult = tratamientoCreateSchema.safeParse(body)
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

    // 1. Buscar el paciente
    const paciente = await prisma.pacientes.findUnique({
      where: { paciente_id: pacienteCi },
      include: {
        personas: true
      }
    })

    if (!paciente) {
      return NextResponse.json(
        { success: false, message: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    const persona = paciente.personas

    // 2. Verificar que el esquema de dosis existe
    const esquemaDosis = await prisma.esquema_dosis.findUnique({
      where: { id: validData.esquemaId },
      include: {
        vacunas: { select: { nombre: true } }
      }
    })

    if (!esquemaDosis) {
      return NextResponse.json(
        { success: false, message: 'Esquema de dosis no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar/crear usuario del paciente si no existe
    const usuarioExistente = await prisma.usuarios.findFirst({
      where: { persona_ci: pacienteCi }
    })

    if (!usuarioExistente) {
      console.log(`Creando usuario para paciente CI: ${pacienteCi}`)

      // Hash del CI como contraseña
      const passwordHash = await bcrypt.hash(pacienteCi, 10)

      const rolPaciente = await prisma.roles.findUnique({
        where: { nombre: 'PACIENTE' }
      })

      if (!rolPaciente) {
        return NextResponse.json(
          {
            success: false,
            message: 'Rol PACIENTE no encontrado en el sistema'
          },
          { status: 500 }
        )
      }

      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          persona_ci: pacienteCi,
          username: pacienteCi,
          password_hash: passwordHash,
          activo: true,
          creado_por: userId
        }
      })

      await prisma.usuarios_roles.create({
        data: {
          usuario_id: nuevoUsuario.usuario_id,
          rol_id: rolPaciente.id,
          desde: new Date()
        }
      })

      console.log(
        `Usuario creado: ${pacienteCi} para ${persona.nombres} ${persona.paterno}`
      )
    }

    console.log('---------------------------------------------------')
    console.log('VERIFICACION')
    // ─────────────────────────────────────────────────────────────────────────────
    // 3.5 VERIFICACIÓN DE ESTADO DEL TRATAMIENTO
    // Bitácora: cada registro en tratamientos es un evento inmutable de lo que pasó.
    // Solo el ÚLTIMO registro cambia de estado; los anteriores quedan como testigos.
    // ─────────────────────────────────────────────────────────────────────────────

    // Obtener el esquema actual (número de dosis y a qué vacuna pertenece)
    const esquemaActual = await prisma.esquema_dosis.findUnique({
      where: { id: validData.esquemaId },
      select: { vacuna_id: true, numero: true }
    })

    console.log(esquemaActual)

    // Obtener todos los esquemas de esta vacuna para saber cuántas dosis tiene en total
    const todosEsquemasVacuna = await prisma.esquema_dosis.findMany({
      where: { vacuna_id: esquemaActual!.vacuna_id },
      orderBy: { numero: 'asc' },
      select: { id: true, numero: true }
    })

    console.log(todosEsquemasVacuna)

    const totalDosis = todosEsquemasVacuna.length
    const esUltimaDosis = esquemaActual!.numero === totalDosis

    // Buscar tratamientos anteriores de esta vacuna para este paciente
    const tratamientosAnteriores = await prisma.tratamientos.findMany({
      where: {
        eliminado_en: null,
        paciente_id: pacienteCi,
        esquema_dosis: {
          vacuna_id: esquemaActual!.vacuna_id
        }
      },
      include: {
        esquema_dosis: { select: { numero: true } }
      },
      orderBy: { fecha_aplicacion: 'asc' }
    })

    // ── Caso REINICIO ────────────────────────────────────────────────────────────
    // Se detecta reinicio cuando la dosis que se intenta registrar ya fue aplicada
    // anteriormente (mismo número de dosis de la misma vacuna).
    // Ejemplo: paciente recibió dosis 1 y 2 de Tifoidea pero se pasó del tiempo
    // máximo → el médico vuelve a aplicar la dosis 1 → REINICIO.
    //
    // Acción: solo el ÚLTIMO tratamiento activo (EN_CURSO) pasa a INCOMPLETA.
    // Los anteriores ya son parte de la bitácora y no se tocan.
    // El nuevo registro entra como EN_CURSO (empieza el ciclo de nuevo).
    // ────────────────────────────────────────────────────────────────────────────
    // ── Lógica de Estado y Reinicio ──
    const ultimoTratamientoGlobal = tratamientosAnteriores.at(-1)

    let esReinicio = false
    if (ultimoTratamientoGlobal) {
      esReinicio =
        esquemaActual!.numero <= ultimoTratamientoGlobal.esquema_dosis.numero
    }

    let estadoNuevoTratamiento: StateTreatmentType = StateTreatment.EN_CURSO

    if (esReinicio && ultimoTratamientoGlobal) {
      // Si es reinicio, marcamos el último tratamiento del ciclo anterior como INCOMPLETO
      await prisma.tratamientos.update({
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
      await prisma.citas.updateMany({
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
        `Citas PENDIENTE del tratamiento anterior ${ultimoTratamientoGlobal.id} marcadas como ${estadoCita}`
      )
    }

    // 4. Crear el tratamiento
    const tratamiento = await prisma.tratamientos.create({
      data: {
        paciente_id: pacienteCi,
        esquema_id: validData.esquemaId,
        estado: estadoNuevoTratamiento,
        observaciones: validData.observaciones || null,
        fecha_aplicacion: new Date(),
        creado_por: userId
      }
    })

    // 4.5. Crear cita futura si fue solicitada (sin doctor por ahora)
    let citaCreada = false
    if (validData.cita) {
      // Buscar un doctor de enfermería o usar el creador como referencia
      // Para citas creadas desde enfermería sin ficha, usamos un doctor genérico
      // El doctor_id es requerido por el modelo de citas, necesitamos buscar uno
      const doctorEnfermeria = await prisma.doctores.findFirst({
        where: { eliminado_en: null }
      })

      if (doctorEnfermeria) {
        await prisma.citas.create({
          data: {
            paciente_id: pacienteCi,
            doctor_id: doctorEnfermeria.doctor_id,
            tratamiento_id: tratamiento.id,
            fecha_programada: new Date(validData.cita.fechaProgramada),
            tipo: validData.cita.tipo,
            estado: 'PENDIENTE',
            observaciones: validData.cita.observaciones || null,
            creado_por: userId
          }
        })
        citaCreada = true
        console.log(
          `Cita creada para paciente ${pacienteCi} — ${validData.cita.tipo} el ${validData.cita.fechaProgramada}`
        )
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Tratamiento registrado exitosamente — ${esquemaDosis.vacunas.nombre} (Dosis ${validData.dosisNumero})${citaCreada ? ' · Cita programada' : ''}`,
        data: {
          tratamiento_id: tratamiento.id,
          paciente: `${persona.nombres} ${persona.paterno} ${persona.materno}`,
          vacuna: esquemaDosis.vacunas.nombre,
          dosis: validData.dosisNumero,
          usuario_creado: !usuarioExistente,
          cita_creada: citaCreada
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating tratamiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
