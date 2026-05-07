import { z } from 'zod'

const disponibilidadSchema = z.object({
  turno_codigo: z.string().min(1, 'Seleccione un turno'),
  cupos: z.number().int().min(0, 'Los cupos deben ser 0 o más'),
  estado: z.boolean().default(true)
})

const especialidadAsignacionSchema = z.object({
  especialidad_id: z.string().uuid('Seleccione una especialidad válida'),
  disponibilidades: z
    .array(disponibilidadSchema)
    .min(1, 'Debe asignar al menos un turno')
})

export const configDoctorSchema = z.object({
  matricula: z.string().max(50).optional().or(z.literal('')),
  especialidades: z.array(especialidadAsignacionSchema)
})

export type DisponibilidadFormData = z.infer<typeof disponibilidadSchema>
export type EspecialidadAsignacionFormData = z.infer<
  typeof especialidadAsignacionSchema
>
export type ConfigDoctorFormData = z.infer<typeof configDoctorSchema>
