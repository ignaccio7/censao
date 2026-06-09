import { z } from 'zod'

// ── Schema para crear una consulta médica ──
export const consultaCreateSchema = z.object({
  fichaOrigenId: z.string().uuid('ID de ficha inválido'),
  consultaPadreId: z.string().uuid('ID de consulta padre inválido').optional(),
  motivoConsulta: z
    .string()
    .min(3, 'El motivo de consulta debe tener al menos 3 caracteres')
    .max(500, 'El motivo de consulta no puede exceder 500 caracteres'),
  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
  requiereRetorno: z.boolean().default(false),
  // Cita de retorno (opcional — solo si requiereRetorno es true)
  cita: z
    .object({
      fechaProgramada: z
        .string()
        .datetime({ message: 'Fecha de cita inválida' }),
      tipo: z.enum(['CONTROL', 'CONSULTA'], {
        message: 'Tipo de cita inválido (solo CONTROL o CONSULTA)'
      }),
      // Doctor override: si viene, se usa este doctor en lugar del de la ficha.
      // Útil cuando la ficha fue reasignada por Enfermería y el doctor quiere
      // programar la cita con el médico original del paciente.
      doctorId: z.string().min(1).optional(),
      // Turno override: el usuario también puede seleccionar el turno específico del doctor.
      turnoCodigo: z.enum(['AM', 'PM']).optional(),
      observaciones: z
        .string()
        .max(500, 'Las observaciones no pueden exceder 500 caracteres')
        .optional()
    })
    .optional()
})

export type ConsultaCreateData = z.infer<typeof consultaCreateSchema>

// ── Schema para actualizar una consulta ──
export const consultaUpdateSchema = z.object({
  motivoConsulta: z
    .string()
    .min(3, 'El motivo de consulta debe tener al menos 3 caracteres')
    .max(500, 'El motivo de consulta no puede exceder 500 caracteres')
    .optional(),
  observaciones: z
    .string()
    .max(1000, 'Las observaciones no pueden exceder 1000 caracteres')
    .optional(),
  requiereRetorno: z.boolean().optional()
})

export type ConsultaUpdateData = z.infer<typeof consultaUpdateSchema>
