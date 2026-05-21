// src/app/api/tratamientos/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { z } from 'zod'

const updateTratamientoSchema = z.object({
  observaciones: z.string().max(1000).nullable().optional()
})

/**
 * PATCH /api/tratamientos/:id
 * Modifica las observaciones de un tratamiento existente del paciente.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos/:uuid',
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

  console.log(uuid)

  try {
    const body = await request.json()
    const parsed = updateTratamientoSchema.safeParse(body)
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

    const tratamiento = await prisma.tratamientos.findUnique({
      where: { id: uuid, eliminado_en: null }
    })
    if (!tratamiento) {
      return NextResponse.json(
        { success: false, message: 'Tratamiento no encontrado' },
        { status: 404 }
      )
    }

    const updated = await prisma.tratamientos.update({
      where: { id: uuid },
      data: {
        observaciones: parsed.data.observaciones ?? null,
        actualizado_por: userId,
        actualizado_en: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Tratamiento actualizado',
      data: { id: updated.id, observaciones: updated.observaciones }
    })
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
