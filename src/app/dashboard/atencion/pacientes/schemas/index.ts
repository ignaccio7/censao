import { z } from 'zod'

export const editarPacienteSchema = z.object({
  ci: z
    .string()
    .min(5, 'El CI debe tener al menos 5 caracteres')
    .max(15, 'El CI no puede exceder 15 caracteres'),
  nombres: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  paterno: z.string().min(2, 'Mínimo 2 caracteres').max(100),
  materno: z.string().max(100).optional().or(z.literal('')),
  telefono: z
    .string()
    .min(7, 'Mínimo 7 dígitos')
    .max(15)
    .optional()
    .or(z.literal('')),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')),
  direccion: z
    .string()
    .min(3, 'Mínimo 3 caracteres')
    .max(200)
    .optional()
    .or(z.literal('')),
  sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
  grupo_sanguineo: z.string().max(5).optional().or(z.literal(''))
})

export type EditarPacienteFormData = z.infer<typeof editarPacienteSchema>

// ── Schema para CREAR paciente (desde Enfermería) ──
export const crearPacienteSchema = z.object({
  ci: z
    .string()
    .min(5, 'El CI debe tener al menos 5 caracteres')
    .max(15, 'El CI no puede exceder 15 caracteres'),
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100),
  paterno: z
    .string()
    .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
    .max(100),
  materno: z.string().max(100).optional().or(z.literal('')),
  telefono: z.string().max(20).optional().or(z.literal('')),
  correo: z.string().email('Correo inválido').optional().or(z.literal('')),
  direccion: z.string().max(200).optional().or(z.literal('')),
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
  grupo_sanguineo: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal(''))
})

export type CrearPacienteFormData = z.infer<typeof crearPacienteSchema>
