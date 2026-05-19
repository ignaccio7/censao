import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const esquemaApiSchema = z.object({
  numero: z.number().min(1),
  intervalo_dias: z.number().min(0),
  edad_min_meses: z.number().min(0).nullable().optional(),
  notas: z.string().max(500).optional().or(z.literal(''))
})

const vacunaApiSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional().or(z.literal('')),
  fabricante: z.string().max(100).optional().or(z.literal('')),
  esquemas: z.array(esquemaApiSchema).min(1)
})

// ─── POST /api/admin/vacunas ──────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/vacunas',
    'POST'
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
    const parsed = vacunaApiSchema.safeParse(body)

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

    const { nombre, descripcion, fabricante, esquemas } = parsed.data

    // Verificar nombre único
    const existente = await prisma.vacunas.findFirst({
      where: { nombre, eliminado_en: null }
    })
    if (existente) {
      return NextResponse.json(
        { success: false, message: 'Ya existe una vacuna con ese nombre' },
        { status: 409 }
      )
    }

    const vacuna = await prisma.$transaction(async tx => {
      const v = await tx.vacunas.create({
        data: {
          nombre,
          descripcion: descripcion || null,
          fabricante: fabricante || null,
          creado_por: idUser
        }
      })

      await tx.esquema_dosis.createMany({
        data: esquemas.map(e => ({
          vacuna_id: v.id,
          numero: e.numero,
          intervalo_dias: e.intervalo_dias,
          edad_min_meses: e.edad_min_meses ?? null,
          notas: e.notas || null,
          creado_por: idUser
        }))
      })

      return v
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Vacuna creada exitosamente',
        data: { id: vacuna.id }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('[POST /api/admin/vacunas]', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
