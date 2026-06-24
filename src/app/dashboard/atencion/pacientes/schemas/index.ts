import { z } from 'zod'

export const editarPacienteSchema = z
  .object({
    ci: z
      .string()
      .min(4, 'El CI debe tener al menos 4 caracteres')
      .max(11, 'El CI no puede exceder 11 caracteres')
      .regex(
        /^[1-9]\d{3,7}(?:-\d[A-Z])?$/,
        'Formato inválido. Ej: 1234567 o 1234567-1B'
      ),
    nombres: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(100)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜćĆšŠ\s']+$/, 'Formato de nombre inválido'),
    paterno: z
      .string()
      .min(2, 'Mínimo 2 caracteres')
      .max(100)
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜćĆšŠ\s']+$/,
        'Formato de apellido inválido'
      ),
    materno: z
      .string()
      .max(100)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜćĆšŠ\s']*$/, 'Formato de apellido inválido')
      .optional()
      .or(z.literal('')),
    telefono: z
      .string()
      .length(8, 'El teléfono debe tener 8 caracteres')
      .regex(/^[1-9]\d{7}$/, 'Ingrese un teléfono válido')
      .optional()
      .or(z.literal('')),
    correo: z.string().email('Correo inválido').optional().or(z.literal('')),
    direccion: z
      .string()
      .min(3, 'Mínimo 3 caracteres')
      .max(200)
      .optional()
      .or(z.literal('')),
    fecha_nacimiento: z.string().optional().or(z.literal('')),
    sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
    grupo_sanguineo: z.string().max(5).optional().or(z.literal('')),
    nro_historia_clinica: z.string().max(50).optional().or(z.literal(''))
  })
  .refine(
    data => {
      if (!data.fecha_nacimiento) return true
      const fecha = new Date(data.fecha_nacimiento)
      return !isNaN(fecha.getTime()) && fecha <= new Date()
    },
    {
      message: 'La fecha de nacimiento no puede ser futura',
      path: ['fecha_nacimiento']
    }
  )

export type EditarPacienteFormData = z.infer<typeof editarPacienteSchema>

// ── Schema para CREAR paciente (desde Enfermería) ──
export const crearPacienteSchema = z
  .object({
    ci: z
      .string()
      .min(4, 'El CI debe tener al menos 4 caracteres')
      .max(11, 'El CI no puede exceder 11 caracteres')
      .regex(
        /^[1-9]\d{3,7}(?:-\d[A-Z])?$/,
        'Formato inválido. Ej: 1234567 o 1234567-1B'
      ),
    nombres: z
      .string()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(100)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜćĆšŠ\s']+$/, 'Formato de nombre inválido'),
    paterno: z
      .string()
      .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
      .max(100)
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜćĆšŠ\s']+$/,
        'Formato de apellido inválido'
      ),
    materno: z
      .string()
      .max(100)
      .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜćĆšŠ\s']*$/, 'Formato de apellido inválido')
      .optional()
      .or(z.literal('')),
    telefono: z
      .string()
      .length(8, 'El teléfono debe tener 8 caracteres')
      .regex(/^[1-9]\d{7}$/, 'Ingrese un teléfono válido')
      .optional()
      .or(z.literal('')),
    correo: z.string().email('Correo inválido').optional().or(z.literal('')),
    direccion: z.string().max(200).optional().or(z.literal('')),
    fecha_nacimiento: z.string().optional().or(z.literal('')),
    sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
    grupo_sanguineo: z
      .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .optional()
      .or(z.literal('')),
    nro_historia_clinica: z.string().max(50).optional().or(z.literal(''))
  })
  .refine(
    data => {
      if (!data.fecha_nacimiento) return true
      const fecha = new Date(data.fecha_nacimiento)
      return !isNaN(fecha.getTime()) && fecha <= new Date()
    },
    {
      message: 'La fecha de nacimiento no puede ser futura',
      path: ['fecha_nacimiento']
    }
  )

export type CrearPacienteFormData = z.infer<typeof crearPacienteSchema>
