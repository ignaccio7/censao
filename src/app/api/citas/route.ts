// src/app/api/citas/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { z } from 'zod'

// Puede llegar o bien tratamientoId o consultaId, dependiendo del tipo de cita pero no ambos ni ninguno
const createCitaSchema = z
  .object({
    tratamientoId: z.string().min(1, 'Se requiere el tratamiento').optional(),
    consultaId: z.string().min(1, 'Se requiere la consulta').optional(),
    // doctorId explícito: solo aplica para citas de consulta (no vacuna).
    // Permite elegir un doctor distinto al de la ficha cuando fue reasignada.
    doctorId: z.string().min(1).optional(),
    fechaProgramada: z
      .string()
      .refine(v => !isNaN(Date.parse(v)), { message: 'Fecha inválida' }),
    tipo: z.enum(['VACUNA', 'CONTROL', 'CONSULTA']),
    // El turno es opcional en Zod porque para Consultas se infiere automáticamente
    turnoCodigo: z.enum(['AM', 'PM']).optional(),
    observaciones: z.string().max(500).optional()
  })
  .refine(
    data => (data.tratamientoId ? !data.consultaId : !data.tratamientoId),
    {
      message: 'Se requiere el identificador a registrar'
    }
  )

/**
 * POST /api/citas
 * Crea una nueva cita vinculada a un tratamiento existente.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  console.log('validando alog')

  const validation = await AuthService.validateApiPermission(
    '/api/citas',
    'POST'
  )
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}

  try {
    const body = await request.json()
    console.log(body)

    const parsed = createCitaSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Datos inválidos',
          errors: parsed.error.flatten()
        },
        { status: 400 }
      )
    }

    let {
      tratamientoId,
      consultaId,
      fechaProgramada,
      tipo,
      turnoCodigo,
      observaciones
    } = parsed.data

    console.log(parsed.data)

    // Validar fecha
    const fecha = new Date(fechaProgramada)
    const hoy = new Date()

    // NORMALIZAMOS AMBOS A "SOLO FECHA" EN UTC
    // Esto ignora las horas y las zonas horarias del servidor
    const soloFechaProgramada = new Date(fecha.toISOString().split('T')[0])
    const soloFechaHoyBolivia = new Date(
      new Date(hoy.getTime() - 4 * 60 * 60 * 1000).toISOString().split('T')[0]
    )

    if (soloFechaProgramada < soloFechaHoyBolivia) {
      return NextResponse.json(
        { success: false, message: 'No puedes agendar citas en el pasado' },
        { status: 400 }
      )
    }

    // Usamos getUTCDay() porque soloFechaProgramada es estrictamente UTC (T00:00:00.000Z)
    const dia = soloFechaProgramada.getUTCDay()
    if (dia === 0 || dia === 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Solo se permiten citas de Lunes a Viernes'
        },
        { status: 400 }
      )
    }

    let pacienteId: string | null = null
    if (tratamientoId) {
      const tratamiento = await prisma.tratamientos.findUnique({
        where: { id: tratamientoId, eliminado_en: null },
        select: { paciente_id: true }
      })
      if (!tratamiento) {
        return NextResponse.json(
          { success: false, message: 'Tratamiento no encontrado' },
          { status: 404 }
        )
      }
      pacienteId = tratamiento.paciente_id
    } else {
      const consulta = await prisma.consultas.findUnique({
        where: { id: consultaId!, eliminado_en: null },
        select: {
          ficha_origen: {
            select: {
              paciente_id: true,
              disponibilidades: {
                select: { turno_codigo: true }
              }
            }
          }
        }
      })
      if (!consulta || !consulta.ficha_origen?.paciente_id) {
        return NextResponse.json(
          { success: false, message: 'Consulta no encontrada' },
          { status: 404 }
        )
      }
      pacienteId = consulta.ficha_origen.paciente_id
      // Inferir turnoCodigo de la ficha origen
      if (
        !turnoCodigo &&
        consulta.ficha_origen.disponibilidades?.turno_codigo
      ) {
        turnoCodigo = consulta.ficha_origen.disponibilidades.turno_codigo as
          | 'AM'
          | 'PM'
      }
    }

    if (!turnoCodigo) {
      return NextResponse.json(
        { success: false, message: 'El turno (AM/PM) es requerido' },
        { status: 400 }
      )
    }

    if (!pacienteId) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se pudo determinar el paciente para la cita'
        },
        { status: 400 }
      )
    }

    // Resolver el doctor de la cita:
    // 1. Si viene doctorId explícito en el body Y es una cita de consulta → usarlo directamente.
    // 2. Si no, buscar el doctor del usuario logueado (lógica original).
    // El path de tratamientos (Enfermería/vacunas) nunca manda doctorId, por lo que
    // siempre cae al fallback del usuario logueado — comportamiento intacto.
    let doctorId: string | null = null

    if (parsed.data.doctorId && parsed.data.consultaId) {
      // Override explícito: verificar que el doctor existe
      const doctorOverride = await prisma.doctores.findUnique({
        where: { doctor_id: parsed.data.doctorId }
      })
      if (doctorOverride) doctorId = doctorOverride.doctor_id
    }

    if (!doctorId) {
      // Fallback: doctor del usuario logueado
      const usuarioActual = await prisma.usuarios.findUnique({
        where: { usuario_id: userId },
        select: { persona_ci: true }
      })
      if (usuarioActual?.persona_ci) {
        const doctor = await prisma.doctores.findUnique({
          where: { doctor_id: usuarioActual.persona_ci }
        })
        if (doctor) doctorId = doctor.doctor_id
      }
    }

    if (!doctorId) {
      const fallback = await prisma.doctores.findFirst({
        where: { eliminado_en: null }
      })
      if (fallback) doctorId = fallback.doctor_id
    }

    if (!doctorId) {
      return NextResponse.json(
        { success: false, message: 'No se encontró un doctor disponible' },
        { status: 500 }
      )
    }

    fecha.setHours(8, 0, 0, 0)

    // Cancelar/vencer citas PENDIENTES previas para esta misma consulta o tratamiento
    // (reprogramación automática)
    const ahora = new Date()
    if (consultaId) {
      // Citas con fecha programada en el pasado -> VENCIDA (el paciente no vino)
      await prisma.citas.updateMany({
        where: {
          consulta_id: consultaId,
          estado: 'PENDIENTE',
          fecha_programada: { lt: ahora },
          eliminado_en: null
        },
        data: {
          estado: 'VENCIDA',
          actualizado_en: ahora,
          actualizado_por: userId
        }
      })

      // Citas con fecha programada hoy o a futuro -> CANCELADA (reprogramación anticipada)
      await prisma.citas.updateMany({
        where: {
          consulta_id: consultaId,
          estado: 'PENDIENTE',
          fecha_programada: { gte: ahora },
          eliminado_en: null
        },
        data: {
          estado: 'CANCELADA',
          actualizado_en: ahora,
          actualizado_por: userId
        }
      })
    } else if (tratamientoId) {
      // Citas con fecha programada en el pasado -> VENCIDA (el paciente no vino)
      await prisma.citas.updateMany({
        where: {
          tratamiento_id: tratamientoId,
          estado: 'PENDIENTE',
          fecha_programada: { lt: ahora },
          eliminado_en: null
        },
        data: {
          estado: 'VENCIDA',
          actualizado_en: ahora,
          actualizado_por: userId
        }
      })

      // Citas con fecha programada hoy o a futuro -> CANCELADA (reprogramación anticipada)
      await prisma.citas.updateMany({
        where: {
          tratamiento_id: tratamientoId,
          estado: 'PENDIENTE',
          fecha_programada: { gte: ahora },
          eliminado_en: null
        },
        data: {
          estado: 'CANCELADA',
          actualizado_en: ahora,
          actualizado_por: userId
        }
      })
    }

    const nuevaCita = await prisma.citas.create({
      data: {
        paciente_id: pacienteId,
        doctor_id: doctorId,
        tratamiento_id: tratamientoId || null,
        consulta_id: consultaId || null,
        fecha_programada: fecha,
        tipo,
        turno_codigo: turnoCodigo,
        estado: 'PENDIENTE',
        observaciones: observaciones || null,
        creado_por: userId
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Cita programada correctamente',
        data: {
          id: nuevaCita.id,
          fecha_programada: nuevaCita.fecha_programada,
          tipo: nuevaCita.tipo,
          estado: nuevaCita.estado,
          observaciones: nuevaCita.observaciones
        }
      },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
