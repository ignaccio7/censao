import { z } from 'zod'

const hhmmRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const turnoSchema = z
  .object({
    nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
    hora_inicio: z.string().regex(hhmmRegex, 'Formato HH:MM requerido'),
    hora_fin: z.string().regex(hhmmRegex, 'Formato HH:MM requerido')
  })
  .refine(
    data => {
      const [hI, mI] = data.hora_inicio.split(':').map(Number)
      const [hF, mF] = data.hora_fin.split(':').map(Number)
      return hI * 60 + mI < hF * 60 + mF
    },
    {
      message: 'La hora de fin debe ser posterior a la hora de inicio',
      path: ['hora_fin']
    }
  )

export type TurnoFormData = z.infer<typeof turnoSchema>
