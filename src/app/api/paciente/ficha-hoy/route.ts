// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'

// ──────────────────────────────────────────────────────────────────────────────
// Helper: obtener el paciente_id (= CI) a partir del usuario_id de la sesión
// ──────────────────────────────────────────────────────────────────────────────
async function getPacienteCiFromUserId(userId: string): Promise<string | null> {
  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: userId },
    select: { persona_ci: true }
  })
  return usuario?.persona_ci ?? null
}

export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/paciente/ficha-hoy',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userId = validation.data?.id ?? ''

  try {
    const pacienteCI = await getPacienteCiFromUserId(userId)

    if (!pacienteCI) {
      return NextResponse.json(
        { error: 'Paciente no encontrado', success: false },
        { status: 404 }
      )
    }

    const turno = await getTurnoActual()
    if (!turno) {
      return NextResponse.json({ success: true, data: null })
    }

    const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()

    // Buscamos la ficha activa (no ATENDIDA) del día y turno para este paciente
    const ficha = await prisma.fichas.findFirst({
      where: {
        paciente_id: pacienteCI,
        fecha_ficha: { gte: inicioUTC, lte: finUTC },
        turno_codigo: turno,
        estado: { notIn: ['ATENDIDA'] },
        eliminado_en: null
      },
      orderBy: { creado_en: 'desc' },
      include: {
        disponibilidades: {
          include: {
            doctores_especialidades: {
              include: {
                doctores: {
                  include: {
                    personas: {
                      select: { nombres: true, paterno: true, materno: true }
                    }
                  }
                },
                especialidades: {
                  select: { nombre: true }
                }
              }
            }
          }
        }
      }
    })

    if (!ficha) {
      return NextResponse.json({ success: true, data: null })
    }

    const doctorPersona =
      ficha.disponibilidades?.doctores_especialidades?.doctores?.personas
    const especialidad =
      ficha.disponibilidades?.doctores_especialidades?.especialidades?.nombre

    let doctorNombre = null
    if (doctorPersona) {
      doctorNombre = `Dr(a). ${doctorPersona.nombres} ${doctorPersona.paterno}`
    }

    const dto = {
      ficha_id: ficha.id,
      orden_turno: ficha.orden_turno,
      nro_ficha: Math.abs(ficha.orden_turno || 0),
      es_programada: (ficha.orden_turno || 0) < 0,
      estado: ficha.estado,
      turno_codigo: ficha.turno_codigo,
      turno_label: ficha.turno_codigo === 'AM' ? 'Mañana' : 'Tarde',
      doctor_nombre: doctorNombre,
      especialidad_nombre: especialidad ?? null
    }

    return NextResponse.json({ success: true, data: dto })
  } catch (error) {
    console.error('Error al obtener ficha de hoy:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}
