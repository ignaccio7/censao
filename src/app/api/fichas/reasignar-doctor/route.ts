// oxlint-disable consistent-type-imports
// oxlint-disable prefer-default-export
// oxlint-disable func-style
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Roles, RECORD_TYPES } from '@/app/api/lib/constants'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'

const reasignarDoctorSchema = z.object({
  doctorOrigenId: z.string().min(1, 'El doctor origen es requerido'),
  especialidadId: z.string().uuid('ID de especialidad inválido'),
  doctorDestinoId: z.string().min(1, 'El doctor destino es requerido')
})

// Estados que se reasignan (el doctor ya los tiene asignados, no hay ADMISION ni ENFERMERIA)
const ESTADOS_REASIGNAR = [
  RECORD_TYPES.EN_ESPERA,
  RECORD_TYPES.ATENDIENDO,
  RECORD_TYPES.CANCELADA
] as const

export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/fichas/reasignar-doctor',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userRole = validation.data?.role

  // Solo estos roles pueden reasignar
  const rolesPermitidos = [
    Roles.DOCTOR_FICHAS,
    Roles.ENFERMERIA,
    Roles.ADMINISTRADOR
  ]
  if (!rolesPermitidos.includes(userRole as any)) {
    return NextResponse.json(
      { error: 'No tiene permisos para realizar esta acción', success: false },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()

    const validationResult = reasignarDoctorSchema.safeParse(body)
    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      return NextResponse.json(
        { success: false, message: 'Error de validación', errors },
        { status: 400 }
      )
    }

    const { doctorOrigenId, especialidadId, doctorDestinoId } =
      validationResult.data

    if (doctorOrigenId === doctorDestinoId) {
      return NextResponse.json(
        {
          success: false,
          message: 'El doctor origen y destino no pueden ser el mismo'
        },
        { status: 400 }
      )
    }

    const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()
    const turno = await getTurnoActual()

    // 1. Buscar disponibilidad del doctor DESTINO para esa especialidad
    //    Primero con el turno actual, luego fallback a cualquier disponibilidad
    let disponibilidadDestino = turno
      ? await prisma.disponibilidades.findFirst({
          where: {
            doctores_especialidades: {
              doctor_id: doctorDestinoId,
              especialidad_id: especialidadId
            },
            turnos_catalogo: { codigo: turno }
          }
        })
      : null

    // Fallback: cualquier disponibilidad del doctor+especialidad
    if (!disponibilidadDestino) {
      disponibilidadDestino = await prisma.disponibilidades.findFirst({
        where: {
          doctores_especialidades: {
            doctor_id: doctorDestinoId,
            especialidad_id: especialidadId
          }
        }
      })
    }

    if (!disponibilidadDestino) {
      return NextResponse.json(
        {
          success: false,
          message:
            'El doctor destino no tiene disponibilidad registrada para esta especialidad'
        },
        { status: 400 }
      )
    }

    // 2. Buscar fichas del doctor ORIGEN de HOY en los estados reasignables
    const fichasAMover = await prisma.fichas.findMany({
      where: {
        fecha_ficha: { gte: inicioUTC, lte: finUTC },
        estado: { in: ESTADOS_REASIGNAR as any },
        disponibilidades: {
          doctores_especialidades: {
            doctor_id: doctorOrigenId,
            especialidad_id: especialidadId
          }
        },
        eliminado_en: null
      },
      select: { id: true, estado: true, orden_turno: true }
    })

    if (fichasAMover.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No hay fichas activas para reasignar de este doctor',
        fichasReasignadas: 0
      })
    }

    const fichaIds = fichasAMover.map(f => f.id)

    // 3. Reasignar: cambiar disponibilidad_id y poner todas en EN_ESPERA
    const resultado = await prisma.fichas.updateMany({
      where: { id: { in: fichaIds } },
      data: {
        disponibilidad_id: disponibilidadDestino.id,
        estado: RECORD_TYPES.EN_ESPERA as any,
        actualizado_en: new Date()
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: `${resultado.count} ficha(s) reasignada(s) exitosamente`,
        fichasReasignadas: resultado.count
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error al reasignar fichas:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
