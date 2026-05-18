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
  params: Promise<{ uuid: string }>
}

// LISTAR CONSULTAS DE UN PACIENTE ESPECÍFICO
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas/paciente/:uuid',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { uuid: pacienteCi } = await params

  try {
    const consultas = await prisma.consultas.findMany({
      where: {
        eliminado_en: null,
        ficha_origen: {
          paciente_id: pacienteCi
        }
      },
      orderBy: { creado_en: 'desc' },
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

    const consultasDto = consultas.map(c => {
      const doctorData =
        c.ficha_origen?.disponibilidades?.doctores_especialidades
      const doctorPersona = doctorData?.doctores?.personas
      const fechaConsulta = new Date(c.creado_en).toLocaleDateString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      return {
        id: c.id,
        motivo_consulta: c.motivo_consulta,
        observaciones: c.observaciones,
        requiere_retorno: c.requiere_retorno,
        fecha_consulta: fechaConsulta,
        doctor_nombre: doctorPersona
          ? `${doctorPersona.nombres} ${doctorPersona.paterno}`.trim()
          : null,
        especialidad: doctorData?.especialidades?.nombre,
        ficha_id: c.ficha_origen.id,
        citas: c.citas
      }
    })

    return NextResponse.json({ success: true, data: consultasDto })
  } catch (error) {
    console.error('Error al obtener consultas del paciente:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// ACTUALIZAR UNA CONSULTA DE UN PACIENTE
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas/paciente/:uuid',
    'PATCH'
  )

  console.log('Parametros: ', params)

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}

  try {
    const body = await request.json()
    const { consultaId, ...updateFields } = body

    if (!consultaId) {
      return NextResponse.json(
        { success: false, message: 'ID de consulta requerido' },
        { status: 400 }
      )
    }

    // Validar campos de actualización
    const validationResult = consultaUpdateSchema.safeParse(updateFields)
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
      where: { id: consultaId }
    })

    if (!consulta) {
      return NextResponse.json(
        { success: false, message: 'Consulta no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar la consulta
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
