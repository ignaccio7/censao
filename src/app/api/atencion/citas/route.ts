// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { Roles } from '@/app/api/lib/constants'

// ──────────────────────────────────────────────────────────────────────────────
// Utilidad: rango UTC de un día en Bolivia (UTC-4)
// ──────────────────────────────────────────────────────────────────────────────
function getRangoUTCBoliviaDia(fecha: Date) {
  const fechaStr = fecha.toLocaleDateString('es-BO', {
    timeZone: 'America/La_Paz',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  const [dia, mes, anio] = fechaStr.split('/').map(Number)
  const inicioUTC = new Date(Date.UTC(anio, mes - 1, dia, 4, 0, 0, 0))
  const finUTC = new Date(Date.UTC(anio, mes - 1, dia + 1, 3, 59, 59, 999))
  return { inicioUTC, finUTC }
}

/**
 * GET /api/atencion/citas?fecha=YYYY-MM-DD
 *
 * ENFERMERIA  → solo citas tipo VACUNA del día (todos los pacientes)
 * DOCTOR_GENERAL → solo citas tipo CONTROL/CONSULTA del día asignadas a él
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/atencion/citas',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userId = validation.data?.id ?? ''
  const userRole = validation.data?.role ?? ''

  // Fecha del query param o hoy por defecto (en Bolivia)
  const { searchParams } = new URL(request.url)
  const fechaParam = searchParams.get('fecha') // formato YYYY-MM-DD

  let fechaBase: Date
  if (fechaParam && !isNaN(Date.parse(fechaParam))) {
    // Interpretar la fecha en zona Bolivia: sumamos 4h para compensar UTC-4
    fechaBase = new Date(`${fechaParam}T12:00:00.000Z`)
  } else {
    fechaBase = new Date()
  }

  const { inicioUTC, finUTC } = getRangoUTCBoliviaDia(fechaBase)

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereClause: any = {
      fecha_programada: { gte: inicioUTC, lte: finUTC },
      estado: { in: ['PENDIENTE', 'GENERADA'] },
      eliminado_en: null
    }

    if (userRole === Roles.ENFERMERIA) {
      // Solo citas de vacuna
      whereClause.tipo = 'VACUNA'
    } else if (userRole === Roles.DOCTOR_GENERAL) {
      // Solo sus citas (CONTROL o CONSULTA)
      whereClause.tipo = { in: ['CONTROL', 'CONSULTA'] }

      // Obtener el CI del doctor (= doctor_id en la tabla)
      const usuario = await prisma.usuarios.findUnique({
        where: { usuario_id: userId },
        select: { persona_ci: true }
      })
      if (!usuario?.persona_ci) {
        return NextResponse.json(
          { error: 'Doctor no encontrado', success: false },
          { status: 404 }
        )
      }
      whereClause.doctor_id = usuario.persona_ci
    } else {
      return NextResponse.json(
        { error: 'Rol no autorizado para esta vista', success: false },
        { status: 403 }
      )
    }

    const citas = await prisma.citas.findMany({
      where: whereClause,
      orderBy: [{ turno_codigo: 'asc' }, { creado_en: 'asc' }],
      include: {
        pacientes: {
          include: {
            personas: {
              select: { nombres: true, paterno: true, materno: true }
            }
          }
        },
        doctores: {
          include: {
            personas: {
              select: { nombres: true, paterno: true }
            }
          }
        },
        tratamientos: {
          include: {
            esquema_dosis: {
              include: {
                vacunas: { select: { nombre: true } }
              }
            }
          }
        }
      }
    })

    const dto = citas.map(c => {
      const persona = c.pacientes.personas
      const doctorPersona = c.doctores.personas
      const vacunaNombre =
        c.tipo === 'VACUNA'
          ? (c.tratamientos?.esquema_dosis?.vacunas?.nombre ?? null)
          : null
      const dosisNumero =
        c.tipo === 'VACUNA'
          ? (c.tratamientos?.esquema_dosis?.numero ?? null)
          : null

      return {
        id: c.id,
        paciente_nombre:
          `${persona.nombres} ${persona.paterno} ${persona.materno ?? ''}`.trim(),
        paciente_ci: c.paciente_id,
        tipo: c.tipo,
        estado: c.estado,
        turno_codigo: c.turno_codigo,
        turno_label: c.turno_codigo === 'AM' ? 'Mañana' : 'Tarde',
        doctor_nombre: doctorPersona
          ? `Dr(a). ${doctorPersona.nombres} ${doctorPersona.paterno}`
          : null,
        fecha_programada: c.fecha_programada.toISOString(),
        vacuna_nombre: vacunaNombre,
        dosis_numero: dosisNumero,
        observaciones: c.observaciones ?? null
      }
    })

    return NextResponse.json({
      success: true,
      data: dto,
      total: dto.length
    })
  } catch (error) {
    console.error('Error al obtener citas de atención:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}
