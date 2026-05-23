// oxlint-disable init-declarations
// oxlint-disable no-magic-numbers
// oxlint-disable prefer-default-export
// oxlint-disable func-style

import prisma from '@/lib/prisma/prisma'
import { NextResponse } from 'next/server'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'

export async function GET() {
  const turno = await getTurnoActual()
  const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()

  try {
    const especialidades = await prisma.especialidades.findMany({
      select: {
        id: true,
        nombre: true,
        doctores_especialidades: {
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
              where: turno ? { turnos_catalogo: { codigo: turno } } : undefined,
              select: {
                id: true,
                cupos: true,
                fichas: {
                  where: {
                    fecha_ficha: {
                      gte: inicioUTC,
                      lte: finUTC
                    }
                  },
                  select: {
                    id: true,
                    estado: true,
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
                    }
                  }
                },
                _count: {
                  select: {
                    fichas: true
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
