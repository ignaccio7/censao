// oxlint-disable prefer-default-export
// oxlint-disable func-style
// oxlint-disable no-magic-numbers
import prisma from '@/lib/prisma/prisma'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'
import { NextResponse } from 'next/server'

/**
 * GET /api/fichas/publico
 * Endpoint PÚBLICO (sin autenticación) para la pantalla de atención.
 * Retorna fichas agrupadas por especialidad y doctor.
 * Solo datos NO sensibles: nombre doctor, especialidad, orden de turno.
 */
export async function GET() {
  const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()
  const turno = getTurnoActual()

  try {
    // Obtener fichas PENDIENTES del turno actual, ordenadas por turno y hora de registro
    const fichasPendientes = await prisma.fichas.findMany({
      where: {
        fecha_ficha: {
          gte: inicioUTC,
          lte: finUTC
        },
        disponibilidades: {
          turno_codigo: turno
        },
        estado: 'PENDIENTE',
        eliminado_en: null
      },
      orderBy: [{ orden_turno: 'asc' }, { fecha_ficha: 'asc' }],
      select: {
        orden_turno: true,
        fecha_ficha: true,
        disponibilidades: {
          select: {
            doctores_especialidades: {
              select: {
                especialidad_id: true,
                especialidades: {
                  select: {
                    nombre: true
                  }
                },
                doctores: {
                  select: {
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
            }
          }
        }
      }
    })

    // Agrupar por especialidad + doctor
    const agrupado = new Map<
      string,
      {
        especialidad_nombre: string
        doctor_nombre: string
        fichas: { orden_turno: number; fecha_ficha: Date }[]
      }
    >()

    for (const ficha of fichasPendientes) {
      const docEsp = ficha.disponibilidades.doctores_especialidades
      const espNombre = docEsp.especialidades.nombre
      const docPersona = docEsp.doctores.personas
      const docNombre =
        `${docPersona.nombres} ${docPersona.paterno} ${docPersona.materno}`.trim()

      const key = `${docEsp.especialidad_id}-${docNombre}`

      if (!agrupado.has(key)) {
        agrupado.set(key, {
          especialidad_nombre: espNombre,
          doctor_nombre: docNombre,
          fichas: []
        })
      }

      agrupado.get(key)!.fichas.push({
        orden_turno: ficha.orden_turno ?? 0,
        fecha_ficha: ficha.fecha_ficha
      })
    }

    // Construir respuesta: primera PENDIENTE = "atendiendo", segunda = "siguiente"
    const especialidades = Array.from(agrupado.values()).map(grupo => ({
      especialidad_nombre: grupo.especialidad_nombre,
      doctor_nombre: grupo.doctor_nombre,
      atendiendo: grupo.fichas[0]?.orden_turno ?? null,
      siguiente: grupo.fichas[1]?.orden_turno ?? null,
      total_pendientes: grupo.fichas.length
    }))

    // Ordenar por nombre de especialidad
    especialidades.sort((a, b) =>
      a.especialidad_nombre.localeCompare(b.especialidad_nombre)
    )

    const fechaBolivia = new Date().toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    return NextResponse.json({
      success: true,
      data: {
        turno,
        fecha: fechaBolivia,
        especialidades
      }
    })
  } catch (error) {
    console.error('Error en fichas públicas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}
