// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { fichaSchema } from '@/app/dashboard/fichas/schemas'
import { RECORD_TYPES } from '@/lib/constants'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FichasService } from './utils'

export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/fichas',
    'GET'
  )

  console.log('-----------------------------------------------VALIDATION')
  console.log(validation)

  if (!validation.success) {
    // return Response.json(
    //   {
    //     error: validation.error,
    //     success: false
    //   },
    //   {
    //     status: validation.status
    //   }
    // )
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  // Obtenemos la ficha segun el ID del doctor y hacemos la consulta segun el rol que tenga
  const idUser = validation.data?.id
  const rolUser = validation.data?.role

  const fechaUTC = new Date()

  const inicioUTC = new Date(
    Date.UTC(
      fechaUTC.getUTCFullYear(),
      fechaUTC.getUTCMonth(),
      fechaUTC.getUTCDate(),
      4,
      0,
      0
    )
  )

  const finUTC = new Date(
    Date.UTC(
      fechaUTC.getUTCFullYear(),
      fechaUTC.getUTCMonth(),
      fechaUTC.getUTCDate() + 1,
      3,
      59,
      59,
      999
    )
  )

  const hour = parseInt(
    new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      hour: 'numeric',
      hour12: false
    })
  )

  console.log('La hora es', hour)

  const turno = hour < 13 ? 'AM' : 'PM'

  console.log(`EL TURNO ES:${turno}`)

  try {
    const fichas = await FichasService.getFichas({
      inicioUTC,
      finUTC,
      turno,
      userId: idUser as string,
      userRole: rolUser as string
    })
    // const fichas = await prisma.fichas.findMany({
    //   where: {
    //     fecha_ficha: {
    //       gte: inicioUTC,
    //       lte: finUTC
    //     },
    //     disponibilidades: {
    //       turno_codigo: {
    //         equals: turno
    //       }
    //     },
    //     eliminado_en: null
    //   },
    //   orderBy: [
    //     {
    //       fecha_ficha: 'asc'
    //     },
    //     {
    //       orden_turno: 'asc'
    //     }
    //   ],

    //   select: {
    //     id: true,
    //     orden_turno: true,
    //     fecha_ficha: true,
    //     estado: true,
    //     pacientes: {
    //       include: {
    //         personas: {
    //           select: {
    //             nombres: true,
    //             paterno: true,
    //             materno: true
    //           }
    //         }
    //       }
    //     },
    //     disponibilidades: {
    //       include: {
    //         doctores_especialidades: {
    //           include: {
    //             doctores: {
    //               select: {
    //                 personas: {
    //                   select: {
    //                     nombres: true,
    //                     paterno: true,
    //                     materno: true
    //                   }
    //                 }
    //               }
    //             },
    //             especialidades: {
    //               select: {
    //                 nombre: true
    //               }
    //             }
    //           }
    //         }
    //       }
    //     }
    //   }
    // })

    const data = fichas.map(ficha => ({
      fecha_ficha: ficha.fecha_ficha
    }))
    console.log(data)

    // console.log(fichas)

    const fichasDto = fichas.map(ficha => {
      const fechaFicha = new Date(ficha.fecha_ficha).toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        hour12: false
      })

      const [fechaBoliviana, horaBoliviana] = fechaFicha.split(', ')

      const statusRecord = ficha.estado
        ? RECORD_TYPES[ficha.estado as keyof typeof RECORD_TYPES]
        : RECORD_TYPES['PENDIENTE']

      return {
        ficha_id: ficha.id,
        orden_turno: ficha.orden_turno,
        fecha_ficha: fechaBoliviana,
        hora_ficha: horaBoliviana,
        estado: statusRecord,
        paciente_id: ficha.pacientes.paciente_id,
        paciente_nombres: `${ficha.pacientes.personas.nombres} ${ficha.pacientes.personas.paterno} ${ficha.pacientes.personas.materno}`,
        turno_codigo: ficha.disponibilidades.turno_codigo,
        doctor_id: ficha.disponibilidades.doctor_especialidad_id,
        doctor_nombre: `${ficha.disponibilidades.doctores_especialidades.doctores.personas.nombres} ${ficha.disponibilidades.doctores_especialidades.doctores.personas.paterno} ${ficha.disponibilidades.doctores_especialidades.doctores.personas.materno}`,
        especialidad_id:
          ficha.disponibilidades.doctores_especialidades.especialidad_id,
        especialidad_nombre:
          ficha.disponibilidades.doctores_especialidades.especialidades.nombre
      }
    })

    return NextResponse.json({ success: true, data: fichasDto })

    // return Response.json({
    //   success: true,
    //   data: fichas
    // })
  } catch (error) {
    console.log('Error al obtener las fichas', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
    // return Response.json(
    //   { error: 'Error interno del servidor', success: false },
    //   {
    //     status: 500
    //   }
    // )
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Validar permisos usando tu método existente
  const validation = await AuthService.validateApiPermission(
    '/api/fichas',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      {
        error: validation.error,
        success: false
      },
      { status: validation.status }
    )
  }

  const { id = '' } = validation.data || {}

  try {
    // Obtener datos del request
    const body = await request.json()

    console.log(`El body es:`, body)

    // Validación de datos
    const validationResult = fichaSchema.safeParse(body)
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

    console.log(`El body es:`, validData)

    // Crear/verificar persona
    let persona = await prisma.personas.findUnique({
      where: { ci: validData.cedula }
    })

    if (persona) {
      // Validacion para verificar que los datos de la persona sean los mismos del formulario
      const nombrePersona =
        `${persona?.nombres} ${persona?.paterno} ${persona?.materno}`.trim()
      const nombreFormulario = validData.nombre.trim()
      console.log(nombrePersona)
      console.log(nombreFormulario)

      if (nombrePersona !== nombreFormulario) {
        return NextResponse.json({
          success: false,
          message: 'Los datos de la persona no coinciden con los del formulario'
        })
      }
    } else {
      const nombreParts = validData.nombre.trim().split(' ')
      const [nombres = '', paterno = '', materno = ''] = nombreParts

      persona = await prisma.personas.create({
        data: {
          ci: validData.cedula,
          nombres,
          paterno,
          materno,
          creado_por: id
        }
      })
    }

    // Crear/verificar paciente
    let paciente = await prisma.pacientes.findUnique({
      where: { paciente_id: validData.cedula }
    })

    if (!paciente) {
      paciente = await prisma.pacientes.create({
        data: {
          paciente_id: validData.cedula,
          fecha_nacimiento: null,
          sexo: null,
          grupo_sanguineo: null,
          creado_por: id
        }
      })
    }

    // Determinar turno actual
    const hour = parseInt(
      new Date().toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        hour: 'numeric',
        hour12: false
      })
    )

    console.log(hour)

    const turno = hour < 13 ? 'AM' : 'PM'

    // Fecha de hoy para la ficha (sin hora)
    // const fechaBolivia = new Date().toLocaleDateString('es-BO', {
    //   timeZone: 'America/La_Paz'
    // })

    // const fechaFicha = new Date(`${fechaBolivia}T00:00:00.000Z`)
    const fechaFicha = new Date()

    const inicioUTC = new Date(
      Date.UTC(
        fechaFicha.getUTCFullYear(),
        fechaFicha.getUTCMonth(),
        fechaFicha.getUTCDate(),
        4,
        0,
        0
      )
    )

    const finUTC = new Date(
      Date.UTC(
        fechaFicha.getUTCFullYear(),
        fechaFicha.getUTCMonth(),
        fechaFicha.getUTCDate() + 1,
        3,
        59,
        59,
        999
      )
    )

    // Buscar disponibilidad del doctor para el turno actual
    const disponibilidad = await prisma.disponibilidades.findFirst({
      where: {
        doctores_especialidades: {
          doctor_id: validData.doctor,
          especialidad_id: validData.especialidad
        },
        turnos_catalogo: {
          codigo: turno
        }
      },
      include: {
        _count: {
          select: {
            fichas: {
              where: {
                fecha_ficha: {
                  gte: inicioUTC,
                  lte: finUTC
                },
                eliminado_en: null
              }
            }
          }
        }
      }
    })

    if (!disponibilidad) {
      return NextResponse.json(
        {
          success: false,
          message: `No hay disponibilidad para este doctor en el turno ${turno}`
        },
        { status: 400 }
      )
    }

    // Verificar capacidad disponible para HOY
    if (disponibilidad._count.fichas >= disponibilidad.cupos) {
      return NextResponse.json(
        {
          success: false,
          message: `El doctor ya no tiene cupos disponibles para el turno ${turno} de hoy`
        },
        { status: 400 }
      )
    }

    // Calcular siguiente orden para HOY
    const siguienteOrden = disponibilidad._count.fichas + 1

    // Crear la ficha
    const nuevaFicha = await prisma.fichas.create({
      data: {
        paciente_id: validData.cedula,
        disponibilidad_id: disponibilidad.id,
        fecha_ficha: fechaFicha,
        orden_turno: siguienteOrden,
        estado: 'PENDIENTE',
        creado_por: id
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: `Ficha creada exitosamente. ${fechaFicha.toLocaleDateString('es-BO')} - Turno ${turno} #${siguienteOrden}`,
        data: {
          ficha_id: nuevaFicha.id,
          paciente: paciente.paciente_id,
          fecha: fechaFicha.toISOString().split('T')[0],
          turno: turno,
          orden: siguienteOrden,
          disponibilidad_id: disponibilidad.id
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating ficha:', error)

    // Manejo específico de error de constraint único
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Error de concurrencia. Otro paciente tomó este turno. Intente nuevamente.'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
