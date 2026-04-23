import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { Roles } from '@/app/api/lib/constants'

export async function GET() {
  // req: Request
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/atencion/pacientes',
      'GET'
    )
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'No estas autorizado para realizar esta accion'
        },
        { status: 403 }
      )
    }

    const esDoctorFichas = validation.data?.role === Roles.DOCTOR_FICHAS
    const userId = validation.data?.id

    const pacientes = await prisma.pacientes.findMany({
      where: {
        eliminado_en: null,
        ...(esDoctorFichas && {
          fichas: {
            some: {
              creado_por: userId,
              eliminado_en: null
            }
          }
        })
      },
      include: {
        personas: true,
        _count: {
          select: { fichas: { where: { eliminado_en: null } } }
        }
      },
      orderBy: { personas: { paterno: 'asc' } }
    })

    return NextResponse.json(
      { success: true, data: pacientes },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error GET /api/atencion/pacientes:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
