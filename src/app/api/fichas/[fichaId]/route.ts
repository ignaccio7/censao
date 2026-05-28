// oxlint-disable consistent-type-imports
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fichaId: string }> }
) {
  try {
    const { fichaId } = await params

    const ficha = await prisma.fichas.findUnique({
      where: { id: fichaId },
      include: {
        cita_origen: {
          include: {
            tratamientos: {
              include: {
                esquema_dosis: {
                  include: {
                    vacunas: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { error: 'Ficha no encontrada', success: false },
        { status: 404 }
      )
    }

    const cita = ficha.cita_origen
    if (!cita) {
      return NextResponse.json({
        data: { ficha_id: ficha.id, estado: ficha.estado },
        success: true
      })
    }

    const tratamientoOrigen = cita.tratamientos

    // Si no hay tratamiento padre (raro, el usuario dice que siempre hay, pero nos protegemos),
    // retornamos solo la ficha y cita
    if (!tratamientoOrigen) {
      return NextResponse.json({
        data: {
          ficha_id: ficha.id,
          paciente_id: ficha.paciente_id,
          estado: ficha.estado,
          cita_origen_id: cita.id,
          cita_origen_tipo: cita.tipo,
          vacuna_id: null,
          vacuna_nombre: null,
          siguiente_esquema_id: null,
          siguiente_dosis_numero: null,
          tratamiento_id: null
        },
        success: true
      })
    }

    const vacunaId = tratamientoOrigen.esquema_dosis?.vacuna_id
    const vacunaNombre = tratamientoOrigen.esquema_dosis?.vacunas?.nombre
    const dosisActual = tratamientoOrigen.esquema_dosis?.numero ?? 0

    // Buscar el siguiente esquema (dosis actual + 1)
    let siguienteEsquema = await prisma.esquema_dosis.findFirst({
      where: {
        vacuna_id: vacunaId,
        numero: dosisActual + 1,
        eliminado_en: null
      }
    })

    // Si no hay dosisActual + 1, buscar la última dosis disponible (por ej, 3 si ya tiene la 3)
    if (!siguienteEsquema) {
      siguienteEsquema = await prisma.esquema_dosis.findFirst({
        where: {
          vacuna_id: vacunaId,
          eliminado_en: null
        },
        orderBy: {
          numero: 'desc'
        }
      })
    }

    return NextResponse.json({
      data: {
        ficha_id: ficha.id,
        paciente_id: ficha.paciente_id,
        estado: ficha.estado,
        cita_origen_id: cita.id,
        cita_origen_tipo: cita.tipo,
        vacuna_id: vacunaId,
        vacuna_nombre: vacunaNombre,
        siguiente_esquema_id: siguienteEsquema?.id ?? null,
        siguiente_dosis_numero: siguienteEsquema?.numero ?? null,
        tratamiento_id: tratamientoOrigen.id
      },
      success: true
    })
  } catch (error) {
    console.error('Error al obtener la ficha:', error)
    return NextResponse.json(
      { error: 'Error al obtener los detalles de la ficha', success: false },
      { status: 500 }
    )
  }
}
