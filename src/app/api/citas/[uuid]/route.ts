// src/app/api/citas/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { z } from 'zod'

const updateCitaSchema = z.object({
  fechaProgramada: z
    .string()
    .refine(v => !isNaN(Date.parse(v)), { message: 'Fecha inválida' })
    .optional(),
  tipo: z.enum(['VACUNA', 'CONTROL', 'CONSULTA']).optional(),
  observaciones: z.string().max(500).nullable().optional()
})

/**
 * PATCH /api/citas/:id
 * Modifica fecha, tipo u observaciones de una cita PENDIENTE.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/citas',
    'PATCH'
  )
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}
  const { uuid } = await params

  try {
    const body = await request.json()
    const parsed = updateCitaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    const cita = await prisma.citas.findUnique({
      where: { id: uuid, eliminado_en: null }
    })
    if (!cita) {
      return NextResponse.json(
        { success: false, message: 'Cita no encontrada' },
        { status: 404 }
      )
    }
    if (cita.estado === 'CANCELADA') {
      return NextResponse.json(
        { success: false, message: 'No se puede modificar una cita cancelada' },
        { status: 400 }
      )
    }

    // Validar que la nueva fecha no sea en el pasado ni fin de semana
    if (parsed.data.fechaProgramada) {
      const nuevaFecha = new Date(parsed.data.fechaProgramada)
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)
      if (nuevaFecha < hoy) {
        return NextResponse.json(
          { success: false, message: 'No puedes agendar citas en el pasado' },
          { status: 400 }
        )
      }
      const dia = nuevaFecha.getDay()
      if (dia === 0 || dia === 6) {
        return NextResponse.json(
          {
            success: false,
            message: 'Solo se permiten citas de Lunes a Viernes'
          },
          { status: 400 }
        )
      }
    }

    const updated = await prisma.citas.update({
      where: { id: uuid },
      data: {
        ...(parsed.data.fechaProgramada && {
          fecha_programada: new Date(parsed.data.fechaProgramada)
        }),
        ...(parsed.data.tipo && { tipo: parsed.data.tipo }),
        ...(parsed.data.observaciones !== undefined && {
          observaciones: parsed.data.observaciones
        }),
        actualizado_por: userId,
        actualizado_en: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cita actualizada correctamente',
      data: {
        id: updated.id,
        fecha_programada: updated.fecha_programada,
        tipo: updated.tipo,
        observaciones: updated.observaciones,
        estado: updated.estado
      }
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/citas/:id
 * Cancela (soft-delete lógico) una cita cambiando su estado a CANCELADA.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/citas',
    'DELETE'
  )
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}
  const { uuid } = await params

  try {
    const cita = await prisma.citas.findUnique({
      where: { id: uuid, eliminado_en: null }
    })
    if (!cita) {
      return NextResponse.json(
        { success: false, message: 'Cita no encontrada' },
        { status: 404 }
      )
    }
    if (cita.estado === 'CANCELADA') {
      return NextResponse.json(
        { success: false, message: 'La cita ya está cancelada' },
        { status: 400 }
      )
    }

    await prisma.citas.update({
      where: { id: uuid },
      data: {
        estado: 'CANCELADA',
        actualizado_por: userId,
        actualizado_en: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cita cancelada correctamente'
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
