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
    fechaProgramada: z
      .string()
      .refine(v => !isNaN(Date.parse(v)), { message: 'Fecha inválida' }),
    tipo: z.enum(['VACUNA', 'CONTROL', 'CONSULTA']),
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

    const { tratamientoId, consultaId, fechaProgramada, tipo, observaciones } =
      parsed.data

    // Validar fecha
    const fecha = new Date(fechaProgramada)
    const hoy = new Date()
    hoy.setHours(0, 0, 0, 0)
    if (fecha < hoy) {
      return NextResponse.json(
        { success: false, message: 'No puedes agendar citas en el pasado' },
        { status: 400 }
      )
    }
    const dia = fecha.getDay()
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
            select: { paciente_id: true }
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

    // Buscar doctor asociado al usuario actual (mismo fallback que batch)
    let doctorId: string | null = null
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
