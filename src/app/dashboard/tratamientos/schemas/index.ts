import { z } from 'zod'

export const tratamientoCreateSchema = z.object({
  fichaOrigenId: z.string().uuid('ID de ficha inválido'),
  esquemaId: z.string().uuid('ID de esquema de dosis inválido'),
  dosisNumero: z
    .number()
    .int()
    .min(1, 'El número de dosis debe ser al menos 1'),
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
        .optional()
    })
    .optional()
})

export type TratamientoCreateData = z.infer<typeof tratamientoCreateSchema>
