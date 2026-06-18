// oxlint-disable prefer-default-export
import AuthService from '@/lib/services/auth-service'
import prisma from '@/lib/prisma/prisma'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/fichas/buscar-paciente?ci=XXX
 * Busca pacientes registrados cuyo CI comience con el valor dado.
 * Retorna máximo 10 resultados con { paciente_id, nombre_completo }.
 * Reutiliza el permiso existente de GET /api/fichas (DOCTOR_FICHAS).
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/fichas',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const ci = request.nextUrl.searchParams.get('ci')?.trim() ?? ''

  if (ci.length < 2) {
    return NextResponse.json({ success: true, data: [] })
  }

  try {
    const pacientes = await prisma.pacientes.findMany({
      where: {
        paciente_id: {
          startsWith: ci
        }
      },
      include: {
        personas: {
          select: {
            ci: true,
            nombres: true,
            paterno: true,
            materno: true
          }
        }
      },
      take: 10,
      orderBy: {
        paciente_id: 'asc'
      }
    })

    const data = pacientes.map(p => ({
      value: p.paciente_id,
      label: [p.personas.nombres, p.personas.paterno, p.personas.materno]
        .filter(Boolean)
        .join(' ')
    }))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error GET /api/fichas/buscar-paciente:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
