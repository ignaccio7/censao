// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'

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

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/notificaciones
// Devuelve las notificaciones del paciente autenticado (ABAC por paciente_id)
// ──────────────────────────────────────────────────────────────────────────────
export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/notificaciones',
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
    // ABAC: obtener el CI del usuario para filtrar solo sus notificaciones
    const pacienteCI = await getPacienteCiFromUserId(userId)

    if (!pacienteCI) {
      return NextResponse.json(
        { error: 'Paciente no encontrado', success: false },
        { status: 404 }
      )
    }

    const notificaciones = await prisma.notificaciones.findMany({
      where: {
        paciente_id: pacienteCI,
        eliminado_en: null
      },
      orderBy: { fecha_envio: 'desc' },
      select: {
        id: true,
        titulo: true,
        mensaje: true,
        fecha_envio: true,
        leido: true,
        medio: true,
        cita_id: true,
        citas: {
          select: {
            tipo: true
          }
        }
      }
    })

    const dto = notificaciones.map(n => ({
      id: n.id,
      titulo: n.titulo,
      mensaje: n.mensaje,
      fecha_envio: n.fecha_envio.toISOString(),
      leido: n.leido,
      medio: n.medio,
      cita_id: n.cita_id,
      tipo_cita: n.citas?.tipo ?? null
    }))

    const no_leidas = dto.filter(n => !n.leido).length

    return NextResponse.json({
      success: true,
      data: dto,
      no_leidas
    })
  } catch (error) {
    console.error('Error al obtener notificaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// ──────────────────────────────────────────────────────────────────────────────
// PATCH /api/notificaciones
// Marca todas las notificaciones no leídas del paciente como leídas
// ──────────────────────────────────────────────────────────────────────────────
export async function PATCH() {
  const validation = await AuthService.validateApiPermission(
    '/api/notificaciones',
    'PATCH'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userId = validation.data?.id ?? ''

  try {
    // ABAC: obtener el CI del usuario para marcar solo sus notificaciones
    const pacienteCI = await getPacienteCiFromUserId(userId)

    if (!pacienteCI) {
      return NextResponse.json(
        { error: 'Paciente no encontrado', success: false },
        { status: 404 }
      )
    }

    const result = await prisma.notificaciones.updateMany({
      where: {
        paciente_id: pacienteCI,
        leido: false,
        eliminado_en: null
      },
      data: {
        leido: true,
        actualizado_en: new Date(),
        actualizado_por: userId
      }
    })

    return NextResponse.json({
      success: true,
      message: `${result.count} notificacion(es) marcada(s) como leídas`,
      count: result.count
    })
  } catch (error) {
    console.error('Error al marcar notificaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}
