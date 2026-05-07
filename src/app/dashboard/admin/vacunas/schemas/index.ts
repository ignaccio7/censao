import { z } from 'zod'

export const esquemaDosisSchema = z.object({
  numero: z.number().min(1),
  intervalo_dias: z.number().min(0, 'No puede ser negativo'),
  edad_min_meses: z.number().min(0).nullable().optional(),
  notas: z.string().max(500).optional().or(z.literal(''))
})

export const vacunaSchema = z
  .object({
    nombre: z.string().min(2, 'Mínimo 2 caracteres').max(100),
    descripcion: z.string().max(500).optional().or(z.literal('')),
    fabricante: z.string().max(100).optional().or(z.literal('')),
    esquemas: z
      .array(esquemaDosisSchema)
      .min(1, 'Debe tener al menos una dosis')
  })
  .superRefine((data, ctx) => {
    data.esquemas.forEach((dosis, i) => {
      // Regla 1: dosis 2+ deben tener intervalo_dias > 0
      if (i > 0 && dosis.intervalo_dias <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'El intervalo debe ser mayor a 0 para dosis posteriores a la primera',
          path: ['esquemas', i, 'intervalo_dias']
        })
      }

      // Regla 2: edad_min_meses debe ser >= a la de la dosis anterior (si ambas existen)
      if (i > 0) {
        const anterior = data.esquemas[i - 1]
        const edadActual = dosis.edad_min_meses
        const edadAnterior = anterior.edad_min_meses

        // TODO verificar pero ahora inhabilitar esto eslint(eqeqeq)
        if (
          // eslint-disable-next-line
          edadActual != null &&
          // eslint-disable-next-line
          edadAnterior != null &&
          edadActual < edadAnterior
        ) {
          // TODO: revisar el flujo de vacunas de creacion esta validacion
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `La edad mínima no puede ser menor a la de la dosis anterior (${edadAnterior} meses)`,
            path: ['esquemas', i, 'edad_min_meses']
          })
        }
      }
    })
  })

export type EsquemaDosisFormData = z.infer<typeof esquemaDosisSchema>
export type VacunaFormData = z.infer<typeof vacunaSchema>
