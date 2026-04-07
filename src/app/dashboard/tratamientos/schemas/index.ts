import { z } from 'zod'

export const tratamientoCreateSchema = z.object({
  fichaOrigenId: z.string().uuid('ID de ficha inválido'),
  esquemaId: z.string().uuid('ID de esquema de dosis inválido'),
  dosisNumero: z.number().int().min(1, 'El número de dosis debe ser al menos 1')
})

export type TratamientoCreateData = z.infer<typeof tratamientoCreateSchema>
