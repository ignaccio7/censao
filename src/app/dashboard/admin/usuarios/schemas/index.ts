import { z } from 'zod'

// ─── Paso 1: Datos de la persona ───────────────────────────────────────────
export const stepPersonaSchema = z.object({
  ci: z
    .string()
    .min(5, 'La cédula debe tener al menos 5 caracteres')
    .max(20, 'La cédula no puede tener más de 20 caracteres'),
  // .regex(/^\d+$/, 'La cédula solo debe contener números'),
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  paterno: z
    .string()
    .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
    .max(50, 'El apellido paterno no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  materno: z
    .string()
    .max(50, 'El apellido materno no puede exceder 50 caracteres')
    .optional()
    .or(z.literal('')),
  correo: z
    .string()
    .email('Ingrese un correo válido')
    .max(255, 'El correo no puede exceder 255 caracteres')
    .optional(),
  telefono: z
    .string()
    .max(20, 'El teléfono no puede exceder 20 caracteres')
    .optional()
    .or(z.literal('')),
  direccion: z
    .string()
    .max(255, 'La dirección no puede exceder 255 caracteres')
    .optional()
    .or(z.literal(''))
})

// ─── Paso 2: Credenciales ──────────────────────────────────────────────────
export const stepCredencialesSchema = z
  .object({
    username: z
      .string()
      .min(4, 'El usuario debe tener al menos 4 caracteres')
      .max(50, 'El usuario no puede exceder 50 caracteres')
      .regex(
        /^[a-zA-Z0-9._-]+$/,
        'Solo se permiten letras, números, puntos, guiones y guiones bajos'
      ),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .max(30, 'La contraseña no puede exceder 30 caracteres'),
    confirmar_password: z.string().min(1, 'Confirme la contraseña')
  })
  .refine(data => data.password === data.confirmar_password, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmar_password']
  })

// ─── Paso 3: Rol y tipo de cuenta ─────────────────────────────────────────
export const stepRolSchema = z.object({
  rol_id: z.string().min(1, 'Seleccione un rol'),
  // Campos de Doctor (condicionales)
  matricula: z.string().optional().or(z.literal('')),
  // Campos de Paciente (condicionales)
  fecha_nacimiento: z.string().optional().or(z.literal('')),
  sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
  grupo_sanguineo: z
    .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional()
    .or(z.literal(''))
})

// ─── Schema completo (para el submit final) ────────────────────────────────
export const createUsuarioSchema = stepPersonaSchema
  .merge(stepCredencialesSchema)
  .merge(stepRolSchema)
// .merge(stepCredencialesSchema.omit({ confirmar_password: true }))

// ─── Tipos inferidos ───────────────────────────────────────────────────────
export type StepPersonaData = z.infer<typeof stepPersonaSchema>
export type StepCredencialesData = z.infer<typeof stepCredencialesSchema>
export type StepRolData = z.infer<typeof stepRolSchema>
export type CreateUsuarioFormData = z.infer<typeof createUsuarioSchema> & {
  confirmar_password: string
}
