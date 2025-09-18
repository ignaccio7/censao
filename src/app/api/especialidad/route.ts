// oxlint-disable init-declarations
// oxlint-disable no-magic-numbers
// oxlint-disable prefer-default-export
// oxlint-disable func-style

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
  const fecha = new Date()

  const hour = parseInt(
    new Date().toLocaleString('es-BO', {
      timeZone: 'America/La_Paz',
      hour: 'numeric',
      hour12: false
    })
  )
  const turno = hour < 13 ? 'AM' : 'PM'

  // Ajustar horas según turno
  let rangoInicio: Date
  let rangoFin: Date

  if (turno === 'AM') {
    rangoInicio = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      7,
      0,
      0
    ) // 07:00
    rangoFin = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      13,
      0,
      0
    ) // 13:00
  } else {
    rangoInicio = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      14,
      0,
      0
    ) // 14:00
    rangoFin = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate(),
      20,
      0,
      0
    ) // 20:00
  }

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
              where: {
                turnos_catalogo: {
                  codigo: {
                    equals: turno
                  }
                }
              },
              select: {
                id: true,
                citas: {
                  where: {
                    fecha_hora_inicial: {
                      gte: rangoInicio,
                      lt: rangoFin
                    }
                  },
                  select: {
                    id: true
                  }
                },
                _count: {
                  select: {
                    citas: true
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
