import { z } from 'zod'

// ── Schema para un solo tratamiento ──
export const tratamientoCreateSchema = z.object({
  pacienteId: z.string().min(1, 'ID del paciente es requerido'),
  esquemaId: z.string().uuid('ID de esquema de dosis inválido'),
  dosisNumero: z
    .number()
    .int()
    .min(1, 'El número de dosis debe ser al menos 1'),
  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
  // Cita futura (opcional)
  cita: z
    .object({
      fechaProgramada: z
        .string()
        .datetime({ message: 'Fecha de cita inválida' }),
      tipo: z.enum(['VACUNA', 'CONTROL', 'CONSULTA'], {
        message: 'Tipo de cita inválido'
      }),
      observaciones: z
        .string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional(),
      turnoCodigo: z.enum(['AM', 'PM'], {
        message: 'Turno inválido'
      })
    })
    .optional()
})

export type TratamientoCreateData = z.infer<typeof tratamientoCreateSchema>

// ── Schema BATCH — registrar N tratamientos + citas en una sola transacción ──
const tratamientoItemSchema = z.object({
  esquemaId: z.string().uuid('ID de esquema de dosis inválido'),
  dosisNumero: z
    .number()
    .int()
    .min(1, 'El número de dosis debe ser al menos 1'),
  vacunaNombre: z.string().optional(), // solo para mensajes de respuesta
  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
  cita: z
    .object({
      fechaProgramada: z
        .string()
        .datetime({ message: 'Fecha de cita inválida' }),
      tipo: z.enum(['VACUNA', 'CONTROL', 'CONSULTA'], {
        message: 'Tipo de cita inválido'
      }),
      observaciones: z
        .string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional(),
      turnoCodigo: z.enum(['AM', 'PM'], {
        message: 'Turno inválido'
      })
    })
    .optional()
})

export const tratamientoBatchCreateSchema = z.object({
  pacienteId: z.string().min(1, 'El ID del paciente es requerido'),
  fichaOrigenId: z.string().uuid().optional(),
  tratamientos: z
    .array(tratamientoItemSchema)
    .min(1, 'Debe registrar al menos un tratamiento')
})

export type TratamientoBatchCreateData = z.infer<
  typeof tratamientoBatchCreateSchema
>
export type TratamientoItemData = z.infer<typeof tratamientoItemSchema>
