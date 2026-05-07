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
export const stepCredencialesSchema = z.object({
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
// .refine(data => data.password === data.confirmar_password, { pasamos esta validacion al esquema completo mediante un superRefine ya que no era capaz de validar el metodo trigger
//   message: 'Las contraseñas no coinciden',
//   path: ['confirmar_password']
// })

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
  .superRefine((data, ctx) => {
    // Validación de contraseñas coincidentes
    if (data.password !== data.confirmar_password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Las contraseñas no coinciden',
        path: ['confirmar_password']
      })
    }

    // Opcional: Validaciones condicionales por rol
    // Si rol es doctor (ajusta el ID según tu base de datos)
    // if (data.rol_id === 'doctor-id-aqui' && !data.matricula) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'La matrícula es requerida para doctores',
    //     path: ['matricula']
    //   });
    // }

    // Si rol es paciente
    // if (data.rol_id === 'paciente-id-aqui' && !data.fecha_nacimiento) {
    //   ctx.addIssue({
    //     code: z.ZodIssueCode.custom,
    //     message: 'La fecha de nacimiento es requerida',
    //     path: ['fecha_nacimiento']
    //   });
    // }
  })

// ─── Tipos inferidos ───────────────────────────────────────────────────────
export type StepPersonaData = z.infer<typeof stepPersonaSchema>
export type StepCredencialesData = z.infer<typeof stepCredencialesSchema>
export type StepRolData = z.infer<typeof stepRolSchema>
export type CreateUsuarioFormData = z.infer<typeof createUsuarioSchema> & {
  confirmar_password: string
}

export const updateUsuarioSchema = z
  .object({
    nombres: z.string().min(2).max(100),
    paterno: z.string().max(50).optional().or(z.literal('')),
    materno: z.string().max(50).optional().or(z.literal('')),
    correo: z.string().email().max(255),
    telefono: z.string().max(20).optional().or(z.literal('')),
    direccion: z.string().max(255).optional().or(z.literal('')),
    // Contraseña opcional en edición
    password: z.string().min(8).max(100).optional().or(z.literal('')),
    confirmar_password: z.string().optional().or(z.literal('')),
    // Rol — sí se puede cambiar en edición
    rol_id: z.string().uuid(),
    // Campos por rol (siempre opcionales en edición)
    matricula: z.string().optional().or(z.literal('')),
    fecha_nacimiento: z.string().optional().or(z.literal('')),
    sexo: z.enum(['M', 'F', 'O']).optional().or(z.literal('')),
    grupo_sanguineo: z
      .enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
      .optional()
      .or(z.literal(''))
  })
  .refine(
    d => {
      if (!d.password || d.password === '') return true
      return d.password === d.confirmar_password
    },
    { message: 'Las contraseñas no coinciden', path: ['confirmar_password'] }
  )

export type UpdateUsuarioFormData = z.infer<typeof updateUsuarioSchema>
