// oxlint-disable consistent-type-imports
// oxlint-disable prefer-default-export
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { StateCita } from '@/lib/constants'

/**
 * POST /api/notificaciones/recordatorio-citas
 *
 * Envía notificaciones internas para citas en estado PENDIENTE
 * que ocurren en las próximas 24 horas desde el instante de ejecución.
 *
 * IDEMPOTENTE: omite citas que ya tienen al menos una notificación en tabla
 *   notificaciones (filtra por cita_id). No cambia el estado de las citas —
 *   siguen en PENDIENTE hasta que el Doctor de Fichas genere las fichas del
 *   turno correspondiente.
 *
 * No crea fichas. Solo registra en tabla notificaciones (medio = 'sistema').
 *
 * Acceso dual:
 *   - Cron job de Vercel → header Authorization: Bearer <CRON_SECRET>
 *   - Llamada manual    → sesión NextAuth con rol DOCTOR_FICHAS o ADMINISTRADOR
 *
 * Zona horaria:
 *   - Almacenamiento: UTC (fecha_envio = new Date())
 *   - Display en mensaje: America/La_Paz (UTC-4, Bolivia)
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // ── 1. Autenticación dual: cron secret o sesión RBAC ─────────────────────
  const authHeader = req.headers.get('authorization') ?? ''
  const cronSecret = process.env.CRON_SECRET

  let operadoPor = 'cron'

  console.log(authHeader)
  console.log(cronSecret)

  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    // Llamada autenticada como cron job de Vercel — no necesita sesión
    operadoPor = 'cron'
  } else {
    // Llamada manual — validar sesión RBAC (DOCTOR_FICHAS o ADMINISTRADOR)
    const validation = await AuthService.validateApiPermission(
      '/api/notificaciones/recordatorio-citas',
      'GET'
    )
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, success: false },
        { status: validation.status }
      )
    }
    operadoPor = validation.data?.id ?? 'manual'
  }

  // ── 2. Ventana de 24 horas desde ahora — almacenado en UTC ───────────────
  // new Date() devuelve UTC internamente; Prisma lo guarda como Timestamptz.
  // No usamos getRangoUTCBoliviaHoy() porque esa función filtra solo HOY
  // (medianoche a medianoche BOT). Aquí necesitamos una ventana deslizante
  // de 24h desde el instante de ejecución, que puede abarcar partes de
  // dos días bolivianos.
  const ahoraUTC = new Date()
  const en24hUTC = new Date(ahoraUTC.getTime() + 24 * 60 * 60 * 1000)

  // ── 3. Buscar citas candidatas (PENDIENTE, próximas 24h) ─────────────────
  const citasCandidatas = await prisma.citas.findMany({
    where: {
      estado: StateCita.PENDIENTE,
      fecha_programada: {
        gte: ahoraUTC,
        lte: en24hUTC
      },
      eliminado_en: null
    },
    include: {
      pacientes: {
        include: {
          personas: {
            select: { nombres: true, paterno: true }
          }
        }
      }
    },
    orderBy: { fecha_programada: 'asc' }
  })

  if (citasCandidatas.length === 0) {
    return NextResponse.json({
      success: true,
      message: 'No hay citas pendientes en las próximas 24 horas',
      enviadas: 0,
      omitidas: 0,
      errores: 0
    })
  }

  // ── 4. Idempotencia: cargar citas que ya tienen notificación ─────────────
  // Una sola query para obtener todos los cita_id ya notificados, evitando
  // N queries dentro del loop. Una cita solo recibe 1 notificación de
  // recordatorio — el campo cita_id actúa como índice de deduplicación.
  const notificacionesExistentes = await prisma.notificaciones.findMany({
    where: {
      cita_id: { in: citasCandidatas.map(c => c.id) },
      eliminado_en: null
    },
    select: { cita_id: true }
  })
  const citasYaNotificadas = new Set(
    notificacionesExistentes.map(n => n.cita_id)
  )

  // ── 5. Procesar cada cita ─────────────────────────────────────────────────
  const enviadas: string[] = []
  const omitidas: string[] = []
  const erroresLog: Array<{ cita_id: string; error: string }> = []

  for (const cita of citasCandidatas) {
    // Idempotencia: ya tiene notificación → omitir silenciosamente
    if (citasYaNotificadas.has(cita.id)) {
      omitidas.push(cita.id)
      continue
    }

    // ── Display en zona horaria Bolivia (UTC-4) ───────────────────────────
    // Solo para construir el texto del mensaje; fecha_envio se guarda en UTC.
    const fechaBolivia = cita.fecha_programada.toLocaleDateString('es-BO', {
      timeZone: 'America/La_Paz',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

    const turnoLabel = cita.turno_codigo === 'AM' ? 'mañana' : 'tarde'

    const tipoLabel =
      cita.tipo === 'VACUNA'
        ? 'vacunación'
        : cita.tipo === 'CONTROL'
          ? 'control médico'
          : 'consulta médica'

    const titulo = `Recordatorio — Cita de ${tipoLabel}`
    const mensaje = `Tienes una cita de ${tipoLabel} el ${fechaBolivia}, turno de la ${turnoLabel}. Preséntate en el Centro de Salud Alto Obrajes.`

    try {
      // fecha_envio = new Date() → se almacena en UTC en la DB (Timestamptz)
      await prisma.notificaciones.create({
        data: {
          paciente_id: cita.paciente_id,
          cita_id: cita.id,
          titulo,
          mensaje,
          medio: 'sistema',
          leido: false,
          fecha_envio: new Date(),
          creado_por: operadoPor
        }
      })
      enviadas.push(cita.id)
    } catch (error) {
      // Registrar fallo sin romper el batch — la cita siguiente sigue procesándose
      console.error(
        `[recordatorio-citas] Error al insertar notificación para cita ${cita.id} (paciente ${cita.paciente_id}):`,
        error
      )
      erroresLog.push({
        cita_id: cita.id,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  // ── 6. Respuesta ──────────────────────────────────────────────────────────
  return NextResponse.json(
    {
      success: true,
      message: `Recordatorios procesados — Enviados: ${enviadas.length}, Omitidos (ya notificados): ${omitidas.length}, Errores: ${erroresLog.length}`,
      enviadas: enviadas.length,
      omitidas: omitidas.length,
      errores: erroresLog.length
    },
    { status: 200 }
  )
}
