// src/app/api/admin/respaldos/restaurar/route.ts
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { backupFileSchema } from '@/app/dashboard/admin/respaldos/schemas'
import { NextRequest, NextResponse } from 'next/server'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Convierte los campos de fecha de string ISO a objetos Date.
 * Prisma requiere objetos Date al insertar — no strings.
 * Las fechas se mantienen en UTC tal cual están en el respaldo.
 */
function parseFechas(
  registro: Record<string, unknown>
): Record<string, unknown> {
  const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(registro)) {
    if (typeof value === 'string' && ISO_DATE_REGEX.test(value)) {
      const fecha = new Date(value)
      // Verificar que sea una fecha válida
      result[key] = isNaN(fecha.getTime()) ? value : fecha
    } else {
      result[key] = value
    }
  }

  return result
}

// ─── POST /api/admin/respaldos/restaurar ─────────────────────────────────────
export async function POST(req: NextRequest) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/respaldos/restaurar',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()

    // ── Validar estructura del archivo con Zod ────────────────────────────
    const parsed = backupFileSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message:
            'El archivo de respaldo no tiene un formato válido para este sistema',
          errors: parsed.error.flatten().fieldErrors
        },
        { status: 422 }
      )
    }

    const { data } = parsed.data

    // ── Transacción interactiva: eliminar + reinsertar atómicamente ───────
    // Si cualquier paso falla, Prisma revierte TODA la operación.
    await prisma.$transaction(
      async tx => {
        // ────────────────────────────────────────────────────────────────
        // FASE 1 — ELIMINACIÓN (hijos primero, respetando FK)
        // ────────────────────────────────────────────────────────────────
        await tx.auditoria_log.deleteMany()
        await tx.notificaciones.deleteMany()
        await tx.citas.deleteMany()
        await tx.consultas.deleteMany()
        await tx.tratamientos.deleteMany()
        await tx.fichas.deleteMany()
        await tx.disponibilidades.deleteMany()
        await tx.usuarios_roles.deleteMany()
        await tx.roles_permisos.deleteMany()
        await tx.doctores_especialidades.deleteMany()
        await tx.usuarios.deleteMany()
        await tx.doctores.deleteMany()
        await tx.pacientes.deleteMany()
        await tx.permisos.deleteMany()
        await tx.roles.deleteMany()
        await tx.personas.deleteMany()
        await tx.esquema_dosis.deleteMany()
        await tx.vacunas.deleteMany()
        await tx.turnos_catalogo.deleteMany()
        await tx.especialidades.deleteMany()

        // ────────────────────────────────────────────────────────────────
        // FASE 2 — INSERCIÓN (padres primero, respetando FK)
        // Las fechas se convierten de string ISO → Date con parseFechas()
        // ────────────────────────────────────────────────────────────────

        if (data.turnos_catalogo.length > 0) {
          await tx.turnos_catalogo.createMany({
            data: data.turnos_catalogo.map(parseFechas) as any[]
          })
        }

        if (data.especialidades.length > 0) {
          await tx.especialidades.createMany({
            data: data.especialidades.map(parseFechas) as any[]
          })
        }

        if (data.vacunas.length > 0) {
          await tx.vacunas.createMany({
            data: data.vacunas.map(parseFechas) as any[]
          })
        }

        if (data.esquema_dosis.length > 0) {
          await tx.esquema_dosis.createMany({
            data: data.esquema_dosis.map(parseFechas) as any[]
          })
        }

        if (data.roles.length > 0) {
          await tx.roles.createMany({
            data: data.roles.map(parseFechas) as any[]
          })
        }

        if (data.permisos.length > 0) {
          await tx.permisos.createMany({
            data: data.permisos.map(parseFechas) as any[]
          })
        }

        if (data.personas.length > 0) {
          await tx.personas.createMany({
            data: data.personas.map(parseFechas) as any[]
          })
        }

        if (data.usuarios.length > 0) {
          await tx.usuarios.createMany({
            data: data.usuarios.map(parseFechas) as any[]
          })
        }

        if (data.doctores.length > 0) {
          await tx.doctores.createMany({
            data: data.doctores.map(parseFechas) as any[]
          })
        }

        if (data.pacientes.length > 0) {
          await tx.pacientes.createMany({
            data: data.pacientes.map(parseFechas) as any[]
          })
        }

        if (data.roles_permisos.length > 0) {
          await tx.roles_permisos.createMany({
            data: data.roles_permisos.map(parseFechas) as any[]
          })
        }

        if (data.usuarios_roles.length > 0) {
          await tx.usuarios_roles.createMany({
            data: data.usuarios_roles.map(parseFechas) as any[]
          })
        }

        if (data.doctores_especialidades.length > 0) {
          await tx.doctores_especialidades.createMany({
            data: data.doctores_especialidades.map(parseFechas) as any[]
          })
        }

        if (data.disponibilidades.length > 0) {
          await tx.disponibilidades.createMany({
            data: data.disponibilidades.map(parseFechas) as any[]
          })
        }

        if (data.fichas.length > 0) {
          await tx.fichas.createMany({
            data: data.fichas.map(parseFechas) as any[]
          })
        }

        // Consultas: primero raíces (consulta_padre_id = null), luego seguimientos
        const consultasRaiz = data.consultas.filter(
          c => c.consulta_padre_id === null || c.consulta_padre_id === undefined
        )
        const consultasHijos = data.consultas.filter(
          c => c.consulta_padre_id !== null && c.consulta_padre_id !== undefined
        )

        if (consultasRaiz.length > 0) {
          await tx.consultas.createMany({
            data: consultasRaiz.map(parseFechas) as any[]
          })
        }

        if (consultasHijos.length > 0) {
          await tx.consultas.createMany({
            data: consultasHijos.map(parseFechas) as any[]
          })
        }

        if (data.tratamientos.length > 0) {
          await tx.tratamientos.createMany({
            data: data.tratamientos.map(parseFechas) as any[]
          })
        }

        if (data.citas.length > 0) {
          await tx.citas.createMany({
            data: data.citas.map(parseFechas) as any[]
          })
        }

        if (data.notificaciones.length > 0) {
          await tx.notificaciones.createMany({
            data: data.notificaciones.map(parseFechas) as any[]
          })
        }

        // auditoria_log al final (depende de usuarios ya insertados)
        if (data.auditoria_log.length > 0) {
          await tx.auditoria_log.createMany({
            data: data.auditoria_log.map(parseFechas) as any[]
          })
        }
      },
      {
        // Timeout generoso para bases de datos grandes
        timeout: 120_000 // 2 minutos
      }
    )

    return NextResponse.json({
      success: true,
      message:
        'Base de datos restaurada exitosamente. Por favor, vuelva a iniciar sesión.'
    })
  } catch (error: any) {
    console.error('[POST /api/admin/respaldos/restaurar]', error)

    // Error de constraint de Prisma
    if (error?.code === 'P2002') {
      return NextResponse.json(
        {
          success: false,
          message:
            'Error de duplicado al restaurar. La operación fue revertida completamente.'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message:
          'Error durante la restauración. La operación fue revertida completamente. La base de datos permanece sin cambios.'
      },
      { status: 500 }
    )
  }
}
