import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
// import { Roles } from '@/app/api/lib/constants'

export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const huerfanas = searchParams.get('huerfanas') === 'true'

    // const esDoctorFichas = validation.data?.role === Roles.DOCTOR_FICHAS
    // const userId = validation.data?.id
    console.log('Estamos entrando aqui')
    // console.log(esDoctorFichas);

    const pacientes = await prisma.pacientes.findMany({
      where: {
        eliminado_en: null,
        fichas: huerfanas
          ? { none: { eliminado_en: null } } // al menos una
          : { some: { eliminado_en: null } } // ninguna
        // ...(esDoctorFichas && {
        // fichas: {
        //   some: {
        //     // creado_por: userId,
        //     eliminado_en: null
        //   }
        // }
        // })
      },
      include: {
        personas: true,
        _count: {
          select: { fichas: { where: { eliminado_en: null } } }
        }
      },
      orderBy: { personas: { paterno: 'asc' } }
    })

    console.log(pacientes)

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
