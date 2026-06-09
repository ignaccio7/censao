// src/app/api/consultas/doctores-por-especialidad/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { DoctoresService } from '@/services/doctores'
import AuthService from '@/lib/services/auth-service'

// TODO: ver si crear la validacion de esta ruta en el seed de permisos para la validacion de los doctores

/**
 * GET /api/consultas/doctores-por-especialidad?especialidadId=<uuid>
 *
 * Devuelve los doctores de una especialidad con sus turnos activos.
 * Usado para poblar el selector de doctor en el formulario de cita de retorno.
 *
 * Respuesta:
 * [{ id: string, nombre: string, turnos: ('AM' | 'PM')[] }]
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas',
    'GET'
  )
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const especialidadId = request.nextUrl.searchParams.get('especialidadId')

  if (!especialidadId) {
    return NextResponse.json(
      { success: false, message: 'Se requiere especialidadId' },
      { status: 400 }
    )
  }

  try {
    const doctoresDisponibles =
      await DoctoresService.getDoctoresConTurnosPorEspecialidad(especialidadId)

    return NextResponse.json(
      { success: true, data: doctoresDisponibles },
      { status: 200 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
