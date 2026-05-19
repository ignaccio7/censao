import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const esquemaUpdateSchema = z.object({
  numero: z.number().min(1),
  intervalo_dias: z.number().min(0),
  edad_min_meses: z.number().min(0).nullable().optional(),
  notas: z.string().max(500).optional().or(z.literal(''))
})

const vacunaUpdateSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().max(500).optional().or(z.literal('')),
  fabricante: z.string().max(100).optional().or(z.literal('')),
  esquemas: z.array(esquemaUpdateSchema).min(1)
})

// ─── PATCH /api/admin/vacunas/[uuid] ─────────────────────────────────────────
// Estrategia: soft-delete de todos los esquemas anteriores + recrear desde cero
// Es más simple y seguro que intentar hacer diff de qué cambió
// ─── PATCH /api/admin/vacunas/[uuid] ─────────────────────────────────────────
// Estrategia: Actualizar solo los esquemas que cambiaron, mantener los existentes
export async function PATCH(
  req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/vacunas/:uuid',
    'PATCH'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const idUser = validation.data?.id

  if (!idUser) {
    return NextResponse.json(
      { success: false, message: 'Usuario no identificado' },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const parsed = vacunaUpdateSchema.safeParse(body)

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

    const vacuna = await prisma.vacunas.findUnique({
      include: {
        esquema_dosis: {
          where: { eliminado_en: null }, // Solo obtener los activos
          select: {
            id: true,
            numero: true,
            intervalo_dias: true,
            edad_min_meses: true,
            notas: true
          }
        }
      },
      where: { id: params.uuid, eliminado_en: null }
    })

    if (!vacuna) {
      return NextResponse.json(
        { success: false, message: 'Vacuna no encontrada' },
        { status: 404 }
      )
    }

    const { nombre, descripcion, fabricante, esquemas } = parsed.data

    // Verificar nombre único (excluyendo la vacuna actual)
    const nombreDuplicado = await prisma.vacunas.findFirst({
      where: { nombre, eliminado_en: null, NOT: { id: params.uuid } }
    })
    if (nombreDuplicado) {
      return NextResponse.json(
        { success: false, message: 'Ya existe otra vacuna con ese nombre' },
        { status: 409 }
      )
    }

    // Crear maps para comparación eficiente
    const esquemasActualesMap = new Map(
      vacuna.esquema_dosis.map(e => [e.numero, e])
    )

    const esquemasNuevosMap = new Map(esquemas.map(e => [e.numero, e]))

    // Identificar qué esquemas necesitan acción
    const esquemasParaActualizar: Array<{
      id: string
      numero: number
      intervalo_dias: number
      edad_min_meses: number | null
      notas: string | null
    }> = []

    const esquemasParaCrear: Array<{
      vacuna_id: string
      numero: number
      intervalo_dias: number
      edad_min_meses: number | null
      notas: string | null
      creado_por: string
    }> = []

    const esquemasParaEliminar: string[] = []

    // Verificar cada esquema actual contra los nuevos
    for (const [numero, esquemaActual] of esquemasActualesMap) {
      const esquemaNuevo = esquemasNuevosMap.get(numero)

      if (!esquemaNuevo) {
        // El esquema ya no existe en la nueva lista -> eliminarlo
        esquemasParaEliminar.push(esquemaActual.id)
      } else {
        // Verificar si hubo cambios en el esquema existente
        const necesitaActualizacion =
          esquemaActual.intervalo_dias !== esquemaNuevo.intervalo_dias ||
          esquemaActual.edad_min_meses !==
            (esquemaNuevo.edad_min_meses ?? null) ||
          esquemaActual.notas !== (esquemaNuevo.notas || null)

        if (necesitaActualizacion) {
          esquemasParaActualizar.push({
            id: esquemaActual.id,
            numero: esquemaNuevo.numero,
            intervalo_dias: esquemaNuevo.intervalo_dias,
            edad_min_meses: esquemaNuevo.edad_min_meses ?? null,
            notas: esquemaNuevo.notas || null
          })
        }
      }
    }

    // Verificar si hay nuevos esquemas que no existen actualmente
    for (const [numero, esquemaNuevo] of esquemasNuevosMap) {
      if (!esquemasActualesMap.has(numero)) {
        esquemasParaCrear.push({
          vacuna_id: params.uuid,
          numero: esquemaNuevo.numero,
          intervalo_dias: esquemaNuevo.intervalo_dias,
          edad_min_meses: esquemaNuevo.edad_min_meses ?? null,
          notas: esquemaNuevo.notas || null,
          creado_por: idUser
        })
      }
    }

    // Ejecutar transacción solo si hay cambios
    if (
      esquemasParaActualizar.length > 0 ||
      esquemasParaCrear.length > 0 ||
      esquemasParaEliminar.length > 0
    ) {
      await prisma.$transaction(async tx => {
        // 1. Actualizar datos de la vacuna
        await tx.vacunas.update({
          where: { id: params.uuid },
          data: {
            nombre,
            descripcion: descripcion || null,
            fabricante: fabricante || null,
            actualizado_por: idUser
          }
        })

        // 2. Actualizar esquemas existentes (solo los que cambiaron)
        for (const esquema of esquemasParaActualizar) {
          await tx.esquema_dosis.update({
            where: { id: esquema.id },
            data: {
              intervalo_dias: esquema.intervalo_dias,
              edad_min_meses: esquema.edad_min_meses,
              notas: esquema.notas,
              actualizado_por: idUser,
              actualizado_en: new Date()
            }
          })
        }

        // 3. Soft-delete de esquemas que ya no existen
        if (esquemasParaEliminar.length > 0) {
          await tx.esquema_dosis.updateMany({
            where: { id: { in: esquemasParaEliminar }, eliminado_en: null },
            data: {
              eliminado_en: new Date(),
              eliminado_por: idUser
            }
          })
        }

        // 4. Crear nuevos esquemas
        if (esquemasParaCrear.length > 0) {
          await tx.esquema_dosis.createMany({
            data: esquemasParaCrear
          })
        }
      })
    } else {
      // Si solo actualizamos datos de la vacuna sin cambios en esquemas
      await prisma.vacunas.update({
        where: { id: params.uuid },
        data: {
          nombre,
          descripcion: descripcion || null,
          fabricante: fabricante || null,
          actualizado_por: idUser
        }
      })

      console.log(
        '✓ Solo se actualizaron datos de la vacuna, los esquemas no cambiaron'
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Vacuna actualizada correctamente',
      changes: {
        updated: esquemasParaActualizar.length,
        created: esquemasParaCrear.length,
        deleted: esquemasParaEliminar.length
      }
    })
  } catch (error) {
    console.error('[PATCH /api/admin/vacunas/:uuid]', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// TODO: implementar al final solo para vacunas recien creadas que no tengan tratamientos asociados solo eso pero al final habilitar el boton de momento funciona con switch soft delete
// ─── DELETE /api/admin/vacunas/[uuid] ────────────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { uuid: string } }
) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/vacunas/:uuid',
    'DELETE'
  )
  if (!validation.success) {
    return NextResponse.json(
      { success: false, message: 'No autorizado' },
      { status: 403 }
    )
  }

  const idUser = validation.data?.id

  try {
    const vacuna = await prisma.vacunas.findUnique({
      where: { id: params.uuid, eliminado_en: null }
    })
    if (!vacuna) {
      return NextResponse.json(
        { success: false, message: 'Vacuna no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene tratamientos activos — no se puede eliminar si está en uso
    const enUso = await prisma.esquema_dosis.findFirst({
      where: {
        vacuna_id: params.uuid,
        eliminado_en: null,
        tratamientos: { some: { eliminado_en: null } }
      }
    })
    if (enUso) {
      return NextResponse.json(
        {
          success: false,
          message:
            'No se puede eliminar: esta vacuna tiene tratamientos activos asociados'
        },
        { status: 409 }
      )
    }

    await prisma.$transaction(async tx => {
      // Soft-delete esquemas
      await tx.esquema_dosis.updateMany({
        where: { vacuna_id: params.uuid, eliminado_en: null },
        data: { eliminado_en: new Date(), eliminado_por: idUser }
      })
      // Soft-delete vacuna
      await tx.vacunas.update({
        where: { id: params.uuid },
        data: { eliminado_en: new Date(), eliminado_por: idUser }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Vacuna eliminada correctamente'
    })
  } catch (error) {
    console.error('[DELETE /api/admin/vacunas/:uuid]', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
