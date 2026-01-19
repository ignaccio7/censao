// oxlint-disable init-declarations
// oxlint-disable no-magic-numbers
// oxlint-disable prefer-default-export
// oxlint-disable func-style
//https://claude.ai/chat/d81ba90b-2adc-40a5-b16f-553d8215578d
import prisma from '@/lib/prisma/prisma'
// import AuthService from '@/lib/services/auth-service'
import { NextResponse } from 'next/server'

export async function GET() {
  // const validation = await AuthService.validateApiPermission(
  //   '/api/especialidades',
  //   'GET'
  // )

  // if (!validation.success) {
  //   return NextResponse.json({
  //     error: validation.error,
  //     success: false
  //   })
  // }

  // Fecha seleccionada por el usuario o hoy
  // const fechaBolivia = new Date().toLocaleDateString('en-CA', {
  //   timeZone: 'America/La_Paz'
  // })

  // const fechaConsulta = new Date(`${fechaBolivia}T00:00:00.000Z`)
  const fechaConsulta = new Date(Date.now())

  const inicioUTC = new Date(
    Date.UTC(
      fechaConsulta.getUTCFullYear(),
      fechaConsulta.getUTCMonth(),
      fechaConsulta.getUTCDate(),
      4,
      0,
      0
    )
  )

  const finUTC = new Date(
    Date.UTC(
      fechaConsulta.getUTCFullYear(),
      fechaConsulta.getUTCMonth(),
      fechaConsulta.getUTCDate() + 1,
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
  const turno = hour < 13 ? 'AM' : 'PM'

  try {
    const especialidades = await prisma.especialidades.findMany({
      select: {
        id: true,
        nombre: true,
        doctores_especialidades: {
          where: {
            disponibilidades: {
              some: {
                turnos_catalogo: {
                  codigo: {
                    equals: turno
                  }
                }
              }
            }
          },
          select: {
            doctores: {
              select: {
                doctor_id: true,
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
              where: {
                turnos_catalogo: {
                  codigo: {
                    equals: turno
                  }
                }
              },
              select: {
                cupos: true,
                turnos_catalogo: {
                  select: {
                    codigo: true,
                    nombre: true,
                    hora_inicio: true,
                    hora_fin: true
                  }
                },
                // fichas: {
                //   where: {
                //     fecha_ficha: {
                //       gte: inicioUTC,
                //       lte: finUTC
                //     }
                //   }
                // },
                _count: {
                  select: {
                    fichas: {
                      where: {
                        fecha_ficha: {
                          gte: inicioUTC,
                          lte: finUTC
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      where: {
        doctores_especialidades: {
          some: {
            disponibilidades: {
              some: {
                turnos_catalogo: {
                  codigo: {
                    equals: turno
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        nombre: 'asc'
      }
    })
    return NextResponse.json({
      success: true,
      data: especialidades
    })
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}
