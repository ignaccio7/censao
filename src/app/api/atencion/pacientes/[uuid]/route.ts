import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/atencion/pacientes/:uuid',
      'GET'
    )
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes permisos para realizar esta accion'
        },
        { status: 403 }
      )
    }

    const paciente = await prisma.pacientes.findUnique({
      where: { paciente_id: uuid, eliminado_en: null },
      include: {
        personas: true,
        fichas: {
          where: { eliminado_en: null },
          include: {
            disponibilidades: {
              include: {
                doctores_especialidades: {
                  include: {
                    doctores: { include: { personas: true } },
                    especialidades: true
                  }
                }
              }
            }
          },
          orderBy: { fecha_ficha: 'desc' }
        }
      }
    })

    if (!paciente) {
      return NextResponse.json(
        { success: false, message: 'Paciente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: paciente }, { status: 200 })
  } catch (error: any) {
    console.error(`Error GET /api/atencion/pacientes/${uuid}:`, error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/atencion/pacientes/:uuid',
      'PATCH'
    )
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes permisos para realizar esta accion'
        },
        { status: 403 }
      )
    }

    const userId = validation?.data?.id || ''
    const body = await req.json()
    const {
      ci,
      nombres,
      paterno,
      materno,
      telefono,
      correo,
      direccion,
      sexo,
      grupo_sanguineo
    } = body

    // Transaction
    await prisma.$transaction(async tx => {
      // If CI is changing, it might fail due to FK constraints if not Cascade
      const targetCi = ci || uuid

      if (targetCi !== uuid) {
        await tx.personas.update({
          where: { ci: uuid },
          data: {
            ci: targetCi,
            nombres,
            paterno,
            materno,
            telefono,
            correo,
            direccion,
            actualizado_por: userId,
            actualizado_en: new Date()
          }
        })

        // Se asume que si el update de personas funcionó (con o sin cascade manual), podemos actualizar pacientes con el targetCi
        await tx.pacientes.update({
          where: { paciente_id: targetCi },
          data: {
            grupo_sanguineo,
            sexo,
            actualizado_por: userId,
            actualizado_en: new Date()
          }
        })
      } else {
        await tx.personas.update({
          where: { ci: uuid },
          data: {
            nombres,
            paterno,
            materno,
            telefono,
            correo,
            direccion,
            actualizado_por: userId,
            actualizado_en: new Date()
          }
        })
        await tx.pacientes.update({
          where: { paciente_id: uuid },
          data: {
            grupo_sanguineo,
            sexo,
            actualizado_por: userId,
            actualizado_en: new Date()
          }
        })
      }
      return true
    })

    return NextResponse.json(
      { success: true, message: 'Paciente actualizado exitosamente' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error(`Error PATCH /api/atencion/pacientes/${uuid}:`, error)
    if (error.code === 'P2003') {
      // Foreign key constraint failed
      return NextResponse.json(
        {
          success: false,
          message:
            'No se puede modificar el CI porque tiene registros relacionados.'
        },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ uuid: string }> }
) {
  console.log('Eliminando')

  const { uuid } = await params
  console.log(uuid)

  try {
    const validation = await AuthService.validateApiPermission(
      '/api/atencion/pacientes/:uuid',
      'DELETE'
    )
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'No tienes permisos para realizar esta accion'
        },
        { status: 403 }
      )
    }

    console.log('Eli')

    const userId = validation?.data?.id || ''

    await prisma.pacientes.update({
      where: { paciente_id: uuid },
      data: { eliminado_en: new Date(), eliminado_por: userId }
    })

    return NextResponse.json(
      { success: true, message: 'Paciente eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error(`Error DELETE /api/atencion/pacientes/${uuid}:`, error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
