import { z } from 'zod'

// ─── Schema de actualización de perfil ─────────────────────────────────────
// Todos los campos son string (RHF los maneja como strings).
// correo y direccion pueden ser vacíos (no se actualizan si están vacíos).
// contraseña: solo se valida/actualiza si se proporciona un valor.
export const updatePerfilSchema = z
  .object({
    correo: z
      .string()
      .max(255, 'El correo no puede exceder 255 caracteres')
      .refine(val => val === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'Ingrese un correo válido'
      }),
    direccion: z
      .string()
      .max(255, 'La dirección no puede exceder 255 caracteres'),
    nueva_password: z
      .string()
      .max(30, 'La contraseña no puede exceder 30 caracteres')
      .refine(
        val =>
          val === '' ||
          (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)),
        {
          message: 'Mínimo 8 caracteres, al menos una mayúscula y un número'
        }
      ),
    confirmar_password: z.string()
  })
  .refine(
    data => {
      if (!data.nueva_password || data.nueva_password === '') return true
      return data.nueva_password === data.confirmar_password
    },
    {
      message: 'Las contraseñas no coinciden',
      path: ['confirmar_password']
    }
  )

export type UpdatePerfilFormData = z.infer<typeof updatePerfilSchema>
