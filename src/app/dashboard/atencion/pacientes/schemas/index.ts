import { z } from 'zod'

export const editarPacienteSchema = z.object({
  ci: z
    .string()
    .min(5, 'El CI debe tener al menos 5 caracteres')
    .max(15, 'El CI no puede exceder 15 caracteres'),
  nombres: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  paterno: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  materno: z.string().max(100).optional().nullable(),
  telefono: z.string().min(7, 'Mínimo 7 dígitos').max(15),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')),
  direccion: z.string().min(3, 'Mínimo 3 caracteres').max(200),
  sexo: z.enum(['M', 'F', 'O']).optional().nullable(),
  grupo_sanguineo: z.string().max(5).optional().nullable()
})

export type EditarPacienteFormData = z.infer<typeof editarPacienteSchema>
