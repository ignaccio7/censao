// src/app/dashboard/admin/respaldos/schemas/index.ts
import { z } from 'zod'

// ─── Metadata del respaldo ────────────────────────────────────────────────────
export const backupMetadataSchema = z.object({
  version: z.string().min(1),
  // Zod v4: z.literal() acepta el valor y opcionalmente { error?: string }
  sistema: z.literal('Censao'),
  fecha_generacion: z.string().datetime({
    message: 'La fecha de generación no tiene un formato válido'
  }),
  generado_por: z.string().min(1),
  estadisticas: z.record(z.string(), z.number())
})

// ─── Arrays de registros (cualquier objeto) ───────────────────────────────────
const registroArray = z.array(z.record(z.string(), z.unknown()))

// ─── Data completa del respaldo ───────────────────────────────────────────────
export const backupDataSchema = z.object({
  turnos_catalogo: registroArray,
  especialidades: registroArray,
  vacunas: registroArray,
  esquema_dosis: registroArray,
  roles: registroArray,
  permisos: registroArray,
  personas: registroArray,
  usuarios: registroArray,
  doctores: registroArray,
  pacientes: registroArray,
  roles_permisos: registroArray,
  usuarios_roles: registroArray,
  doctores_especialidades: registroArray,
  disponibilidades: registroArray,
  fichas: registroArray,
  consultas: registroArray,
  tratamientos: registroArray,
  citas: registroArray,
  notificaciones: registroArray,
  auditoria_log: registroArray
})

// ─── Schema completo del archivo de respaldo ──────────────────────────────────
export const backupFileSchema = z.object({
  metadata: backupMetadataSchema,
  data: backupDataSchema
})

export type BackupFileInput = z.infer<typeof backupFileSchema>
