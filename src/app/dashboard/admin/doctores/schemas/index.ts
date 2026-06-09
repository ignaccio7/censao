import { z } from 'zod'

const disponibilidadSchema = z.object({
  turno_codigo: z.string().min(1, 'Seleccione un turno'),
  cupos: z.number().int().min(0, 'Los cupos deben ser 0 o más'),
  estado: z.boolean()
})

const especialidadAsignacionSchema = z
  .object({
    especialidad_id: z.string().uuid('Seleccione una especialidad válida'),
    disponibilidades: z
      .array(disponibilidadSchema)
      .min(1, 'Debe asignar al menos un turno')
  })
  .refine(
    data => {
      const turnos = data.disponibilidades.map(d => d.turno_codigo)
      return new Set(turnos).size === turnos.length
    },
    {
      message:
        'Una misma especialidad no puede tener el mismo turno más de una vez'
    }
  )

export const configDoctorSchema = z
  .object({
    matricula: z.string().max(50).optional().or(z.literal('')),
    especialidades: z.array(especialidadAsignacionSchema)
  })
  .superRefine((data, ctx) => {
    // Recopilar todos los turnos activos → detectar si el mismo turno aparece
    // activo en 2 especialidades distintas del mismo doctor
    const turnoEspecialidad = new Map<string, string>() // turno_codigo → especialidad_id

    data.especialidades.forEach((esp, espIndex) => {
      esp.disponibilidades.forEach((disp, dispIndex) => {
        if (!disp.estado) return // los turnos inactivos no cuentan

        const conflicto = turnoEspecialidad.get(disp.turno_codigo)
        if (conflicto) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `El turno "${disp.turno_codigo}" ya está activo en otra especialidad. Un doctor solo puede atender una especialidad por turno.`,
            path: [
              'especialidades',
              espIndex,
              'disponibilidades',
              dispIndex,
              'turno_codigo'
            ]
          })
        } else {
          turnoEspecialidad.set(disp.turno_codigo, esp.especialidad_id)
        }
      })
    })
  })

export type DisponibilidadFormData = z.infer<typeof disponibilidadSchema>
export type EspecialidadAsignacionFormData = z.infer<
  typeof especialidadAsignacionSchema
>
export type ConfigDoctorFormData = z.infer<typeof configDoctorSchema>
