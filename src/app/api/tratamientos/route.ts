// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { tratamientoCreateSchema } from '@/app/dashboard/tratamientos/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Roles } from '@/app/api/lib/constants'
import { StateTreatment } from '@/lib/constants'

// LISTAR TRATAMIENTOS DEL DOCTOR
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

  const userId = validation.data?.id
  const userRole = validation.data?.role

  try {
    // Filtro base: tratamientos no eliminados
    const whereClause: any = {
      eliminado_en: null
    }

    // Si es DOCTOR_GENERAL, filtrar solo sus tratamientos (a través de la ficha)
    if (userRole === Roles.DOCTOR_GENERAL) {
      whereClause.ficha_origen = {
        disponibilidades: {
          doctores_especialidades: {
            doctores: {
              personas: {
                usuarios: {
                  some: {
                    usuario_id: userId
                  }
                }
              }
            }
          }
        }
      }
    }

    const tratamientos = await prisma.tratamientos.findMany({
      where: whereClause,
      orderBy: { creado_en: 'desc' },
      select: {
        id: true,
        estado: true,
        fecha_aplicacion: true,
        creado_en: true,
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
        ficha_origen: {
          select: {
            id: true,
            orden_turno: true,
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
            },
            disponibilidades: {
              select: {
                doctores_especialidades: {
                  select: {
                    especialidades: {
                      select: { nombre: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const tratamientosDto = tratamientos.map(t => {
      const persona = t.ficha_origen.pacientes.personas
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
        paciente_ci: t.ficha_origen.pacientes.paciente_id,
        vacuna_nombre: t.esquema_dosis.vacunas.nombre,
        vacuna_fabricante: t.esquema_dosis.vacunas.fabricante,
        dosis_notas: t.esquema_dosis.notas,
        estado: t.estado,
        fecha_aplicacion: fechaAplicacion,
        especialidad:
          t?.ficha_origen?.disponibilidades?.doctores_especialidades
            ?.especialidades?.nombre,
        ficha_id: t.ficha_origen.id
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

    // 1. Buscar la ficha origen con datos del paciente y doctor asignado
    const ficha = await prisma.fichas.findUnique({
      where: { id: validData.fichaOrigenId },
      include: {
        pacientes: {
          include: {
            personas: true
          }
        },
        disponibilidades: {
          select: {
            doctores_especialidades: {
              select: {
                doctor_id: true
              }
            }
          }
        }
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { success: false, message: 'Ficha no encontrada' },
        { status: 404 }
      )
    }

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
    const pacienteCi = ficha.pacientes.paciente_id
    const persona = ficha.pacientes.personas

    const usuarioExistente = await prisma.usuarios.findFirst({
      where: { persona_ci: pacienteCi }
    })

    if (!usuarioExistente) {
      console.log(`Creando usuario para paciente CI: ${pacienteCi}`)

      // Hash del CI como contraseña
      const passwordHash = await bcrypt.hash(pacienteCi, 10)

      // Buscar el rol PACIENTE
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

      // Crear usuario con CI como username y password
      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          persona_ci: pacienteCi,
          username: pacienteCi,
          password_hash: passwordHash,
          activo: true,
          creado_por: userId
        }
      })

      // Asignar rol PACIENTE
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

    console.log(totalDosis)
    console.log(esUltimaDosis)

    // Buscar TODOS los tratamientos anteriores de esta vacuna para este paciente
    // ordenados del más antiguo al más reciente
    const tratamientosAnteriores = await prisma.tratamientos.findMany({
      where: {
        eliminado_en: null,
        ficha_origen: {
          paciente_id: pacienteCi
        },
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
    const dosisYaAplicada = tratamientosAnteriores.some(
      t => t.esquema_dosis.numero === esquemaActual!.numero
    )

    let estadoNuevoTratamiento: string

    if (dosisYaAplicada) {
      // Solo marcar como INCOMPLETA el último tratamiento EN_CURSO de esta vacuna
      // (el más reciente que todavía estaba activo)
      const ultimoEnCurso = tratamientosAnteriores
        .filter(t => t.estado === StateTreatment.EN_CURSO)
        .at(-1) // el más reciente

      if (ultimoEnCurso) {
        await prisma.tratamientos.update({
          where: { id: ultimoEnCurso.id },
          data: {
            estado: 'INCOMPLETA',
            actualizado_por: userId,
            actualizado_en: new Date()
          }
        })
      }

      // El nuevo registro reinicia el ciclo
      estadoNuevoTratamiento = StateTreatment.EN_CURSO

      // ── Caso COMPLETADA ──────────────────────────────────────────────────────────
      // Se marca COMPLETADA únicamente cuando:
      //   1. Es la última dosis del esquema
      //   2. Todas las dosis anteriores fueron aplicadas (existen como EN_CURSO en la bitácora)
      //
      // Solo el nuevo registro (la última dosis) entra como COMPLETADA.
      // Los anteriores se quedan como EN_CURSO — son la bitácora de lo que ocurrió.
      // ────────────────────────────────────────────────────────────────────────────
    } else if (esUltimaDosis) {
      // Verificar que existan registros EN_CURSO para todas las dosis anteriores
      const numerosAplicados = new Set(
        tratamientosAnteriores
          .filter(t => t.estado === StateTreatment.EN_CURSO)
          .map(t => t.esquema_dosis.numero)
      )

      const todasLasAnterioresAplicadas = todosEsquemasVacuna
        .filter(e => e.numero < esquemaActual!.numero)
        .every(e => numerosAplicados.has(e.numero))

      // Si están todas las dosis previas → la última entra como COMPLETADA
      // Si falta alguna dosis previa → entra igual como EN_CURSO (esquema incompleto aún)
      estadoNuevoTratamiento = todasLasAnterioresAplicadas
        ? StateTreatment.COMPLETADA
        : StateTreatment.EN_CURSO

      // ── Caso NORMAL (dosis intermedia) ──────────────────────────────────────────
      // Dosis aplicada en orden, no es la última → entra como EN_CURSO.
      // Queda en la bitácora esperando que lleguen las siguientes dosis.
      // ────────────────────────────────────────────────────────────────────────────
    } else {
      estadoNuevoTratamiento = StateTreatment.EN_CURSO
    }

    // 4. Crear el tratamiento
    const tratamiento = await prisma.tratamientos.create({
      data: {
        ficha_origen_id: validData.fichaOrigenId,
        esquema_id: validData.esquemaId,
        estado: estadoNuevoTratamiento,
        fecha_aplicacion: new Date(),
        creado_por: userId
      }
    })

    // 4.5. Crear cita futura si fue solicitada
    let citaCreada = false
    if (validData.cita) {
      const doctorId =
        ficha.disponibilidades?.doctores_especialidades?.doctor_id

      if (!doctorId) {
        console.warn(
          'No se pudo obtener el doctor_id de la ficha para crear la cita'
        )
      } else {
        await prisma.citas.create({
          data: {
            paciente_id: pacienteCi,
            doctor_id: doctorId,
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

    // 5. Marcar la ficha como ATENDIDA
    await prisma.fichas.update({
      where: { id: validData.fichaOrigenId },
      data: {
        estado: 'ATENDIDA',
        actualizado_por: userId
      }
    })

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
