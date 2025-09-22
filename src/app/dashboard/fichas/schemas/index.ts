import { z } from 'zod'

export const fichaSchema = z.object({
  cedula: z
    .string()
    .min(1, 'La cédula es requerida')
    .regex(/^\d+$/, 'La cédula debe contener solo números')
    .min(7, 'La cédula debe tener al menos 7 dígitos')
    .max(10, 'La cédula no puede tener más de 10 dígitos'),

  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    ),

  especialidad: z.uuid('ID de especialidad inválido'),

  doctor: z.uuid('ID del doctor inválido')
})

export type FichaFormData = z.infer<typeof fichaSchema>
