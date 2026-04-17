import { StateRecord } from '@/lib/constants'
import { z } from 'zod'

export const fichaRegisterSchema = z.object({
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
    )
})

export type FichaRegisterFormData = z.infer<typeof fichaRegisterSchema>

export const fichaAssignSchema = z.object({
  id: z.string().uuid('ID de la ficha inválido'),
  especialidad: z.string().uuid('Seleccione una especialidad'),
  doctor: z.string().min(1, 'Seleccione un doctor'),
  status: z.string().optional()
})

export type FichaAssignFormData = z.infer<typeof fichaAssignSchema>

export const fichaUpdateSchema = z.object({
  id: z.string().uuid('ID de la ficha invalido'),
  status: z.enum([
    StateRecord.ADMISION,
    StateRecord.ENFERMERIA,
    StateRecord.ATENDIDA,
    StateRecord.CANCELADA
  ]),
  cedula: z
    .string()
    .min(1, 'La cédula es requerida')
    .regex(/^\d+$/, 'La cédula debe contener solo números')
    .min(7, 'La cédula debe tener al menos 7 dígitos')
    .max(10, 'La cédula no puede tener más de 10 dígitos')
    .optional(),
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede tener más de 100 caracteres')
    .regex(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      'El nombre solo puede contener letras y espacios'
    )
    .optional(),
  especialidad: z.uuid('ID de especialidad inválido').optional(),
  doctor: z
    .string()
    .min(1, 'El doctor es requerido')
    .regex(/^\d+$/, 'El doctor debe contener solo números')
    .optional()
})

export type FichaUpdateFormData = z.infer<typeof fichaUpdateSchema>
