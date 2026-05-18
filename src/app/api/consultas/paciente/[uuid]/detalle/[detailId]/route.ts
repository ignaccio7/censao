// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { consultaUpdateSchema } from '@/app/dashboard/consultas/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{ uuid: string; detailId: string }>
}

// OBTENER DETALLE DE UNA CONSULTA ESPECÍFICA
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas/paciente/:uuid/detalle/:uuid',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { detailId: consultaId } = await params

  try {
    const consulta = await prisma.consultas.findUnique({
      where: { id: consultaId, eliminado_en: null },
      select: {
        id: true,
        motivo_consulta: true,
        observaciones: true,
        requiere_retorno: true,
        creado_en: true,
        ficha_origen: {
          select: {
            id: true,
            orden_turno: true,
            fecha_ficha: true,
            pacientes: {
              select: {
                paciente_id: true,
                personas: {
                  select: {
                    nombres: true,
                    paterno: true,
                    materno: true
                  }
                }
              }
            },
            disponibilidades: {
              select: {
                doctores_especialidades: {
                  select: {
                    doctores: {
                      select: {
                        personas: {
                          select: {
                            nombres: true,
                            paterno: true
                          }
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
        },
        citas: {
          where: { eliminado_en: null },
          select: {
            id: true,
            fecha_programada: true,
            tipo: true,
            estado: true,
            observaciones: true
          },
          orderBy: { fecha_programada: 'asc' }
        }
      }
    })

    if (!consulta) {
      return NextResponse.json(
        { success: false, message: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    const persona = consulta.ficha_origen.pacientes.personas
    const doctorData =
      consulta.ficha_origen?.disponibilidades?.doctores_especialidades
    const doctorPersona = doctorData?.doctores?.personas

    const consultaDto = {
      id: consulta.id,
      motivo_consulta: consulta.motivo_consulta,
      observaciones: consulta.observaciones,
      requiere_retorno: consulta.requiere_retorno,
      fecha_consulta: new Date(consulta.creado_en).toLocaleDateString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      paciente_nombre:
        `${persona.nombres} ${persona.paterno} ${persona.materno}`.trim(),
      paciente_ci: consulta.ficha_origen.pacientes.paciente_id,
      doctor_nombre: doctorPersona
        ? `${doctorPersona.nombres} ${doctorPersona.paterno}`.trim()
        : null,
      especialidad: doctorData?.especialidades?.nombre,
      ficha_id: consulta.ficha_origen.id,
      citas: consulta.citas
    }

    return NextResponse.json({ success: true, data: consultaDto })
  } catch (error) {
    console.error('Error al obtener detalle de consulta:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// ACTUALIZAR UNA CONSULTA ESPECÍFICA
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas/paciente/:uuid/detalle/:uuid',
    'PATCH'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}
  const { detailId: consultaId } = await params

  try {
    const body = await request.json()

    // Validar campos de actualización
    const validationResult = consultaUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      return NextResponse.json(
        {
          success: false,
          message: 'Error de validación',
          errors
        },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    // Verificar que la consulta existe
    const consulta = await prisma.consultas.findUnique({
      where: { id: consultaId, eliminado_en: null }
    })

    if (!consulta) {
      return NextResponse.json(
        { success: false, message: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    const consultaActualizada = await prisma.consultas.update({
      where: { id: consultaId },
      data: {
        ...(validData.motivoConsulta !== undefined && {
          motivo_consulta: validData.motivoConsulta
        }),
        ...(validData.observaciones !== undefined && {
          observaciones: validData.observaciones
        }),
        ...(validData.requiereRetorno !== undefined && {
          requiere_retorno: validData.requiereRetorno
        }),
        actualizado_por: userId,
        actualizado_en: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Consulta actualizada exitosamente',
      data: consultaActualizada
    })
  } catch (error) {
    console.error('Error al actualizar consulta:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// ELIMINAR (SOFT DELETE) UNA CONSULTA
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas/paciente/:uuid/detalle/:uuid',
    'DELETE'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}
  const { detailId: consultaId } = await params

  try {
    const consulta = await prisma.consultas.findUnique({
      where: { id: consultaId, eliminado_en: null }
    })

    if (!consulta) {
      return NextResponse.json(
        { success: false, message: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Soft delete
    await prisma.consultas.update({
      where: { id: consultaId },
      data: {
        eliminado_en: new Date(),
        eliminado_por: userId
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Consulta eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error al eliminar consulta:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
