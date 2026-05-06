'use client'

import {
  IconCredential,
  IconEmail,
  IconLocation,
  IconPhone,
  IconUser
} from '@/app/components/icons/icons'
import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'
import { FieldInput } from '@/app/components/ui/form/field-input'

interface StepPersonaProps {
  form: UseFormReturn<CreateUsuarioFormData>
  isEdit?: boolean
}

export default function StepPersona({
  form,
  isEdit = false
}: StepPersonaProps) {
  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-bold text-gray-800'>Datos personales</h2>
        <p className='text-sm text-gray-500 mt-0.5'>
          Información básica de identificación de la persona.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {/* CI */}
        <FieldInput
          id='ci'
          label='Cédula de Identidad'
          placeholder='12345678'
          required
          icon={<IconCredential />}
          form={form}
          disabled={isEdit}
        />

        {/* Nombres */}
        <FieldInput
          id='nombres'
          label='Nombres'
          placeholder='Juan Carlos'
          required
          icon={<IconUser />}
          form={form}
        />

        {/* Paterno */}
        <FieldInput
          id='paterno'
          label='Apellido Paterno'
          placeholder='Pérez'
          icon={<IconUser />}
          form={form}
        />

        {/* Materno */}
        <FieldInput
          id='materno'
          label='Apellido Materno'
          placeholder='García'
          icon={<IconUser />}
          form={form}
        />

        {/* Correo - full width */}
        <FieldInput
          id='correo'
          label='Correo electrónico'
          placeholder='usuario@ejemplo.com'
          required
          type='email'
          icon={<IconEmail />}
          form={form}
          className='md:col-span-2'
        />

        {/* Teléfono */}
        <FieldInput
          id='telefono'
          label='Teléfono'
          placeholder='71234567'
          type='tel'
          icon={<IconPhone />}
          form={form}
        />

        {/* Dirección */}
        <FieldInput
          id='direccion'
          label='Dirección'
          placeholder='Av. Arce #123, La Paz'
          icon={<IconLocation />}
          form={form}
        />
      </div>
    </div>
  )
}
