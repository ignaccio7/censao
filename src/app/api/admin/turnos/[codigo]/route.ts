import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

const turnoUpdateSchema = z
  .object({
    nombre: z.string().min(2).max(100),
    hora_inicio: z.string().regex(hhmmRegex, 'Formato HH:MM requerido'),
    hora_fin: z.string().regex(hhmmRegex, 'Formato HH:MM requerido')
  })
  .refine(
    data => {
      const [hI, mI] = data.hora_inicio.split(':').map(Number)
      const [hF, mF] = data.hora_fin.split(':').map(Number)
      return hI * 60 + mI < hF * 60 + mF
    },
    {
      message: 'La hora de fin debe ser posterior a la de inicio',
      path: ['hora_fin']
    }
  )

function boliviaTimeToUTC(hhmm: string): Date {
  const [hour, minute] = hhmm.split(':').map(Number)

  // Bolivia es UTC-4, entonces hora UTC = hora Bolivia + 4
  let utcHour = hour + 4
  let dayOffset = 0

  // Si pasamos las 24 horas, pasamos al día siguiente
  if (utcHour >= 24) {
    utcHour -= 24
    dayOffset = 1
  }

  // Crear fecha UTC con el offset correcto
  const utcDate = new Date(Date.UTC(1970, 0, 1 + dayOffset, utcHour, minute, 0))
  return utcDate
}

// ─── GET /api/admin/turnos/[codigo] ──────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: { codigo: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/turnos/:codigo',
    'GET'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const turno = await prisma.turnos_catalogo.findUnique({
    where: { codigo: params.codigo, eliminado_en: null }
  })

  if (!turno) {
    return NextResponse.json(
      { success: false, message: 'Turno no encontrado' },
      { status: 404 }
    )
  }

  return NextResponse.json({ success: true, data: turno })
}

// ─── PATCH /api/admin/turnos/[codigo] ────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: { codigo: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/turnos/:codigo',
    'PATCH'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const idUser = validation.data?.id

  try {
    const body = await req.json()
    const parsed = turnoUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 422 }
      )
    }

    const turno = await prisma.turnos_catalogo.findUnique({
      where: { codigo: params.codigo, eliminado_en: null }
    })
    if (!turno) {
      return NextResponse.json(
        { success: false, message: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    const { nombre, hora_inicio, hora_fin } = parsed.data
    const horaInicioUTC = boliviaTimeToUTC(hora_inicio)
    const horaFinUTC = boliviaTimeToUTC(hora_fin)

    await prisma.turnos_catalogo.update({
      where: { codigo: params.codigo },
      data: {
        nombre,
        hora_inicio: horaInicioUTC,
        hora_fin: horaFinUTC,
        actualizado_por: idUser
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Turno actualizado correctamente'
    })
  } catch (error) {
    console.error('[PATCH /api/admin/turnos/:codigo]', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
