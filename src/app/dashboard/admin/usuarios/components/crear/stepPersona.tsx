'use client'

import { IconCredential, IconUser } from '@/app/components/icons/icons'
import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'

interface StepPersonaProps {
  form: UseFormReturn<CreateUsuarioFormData>
}

interface FieldProps {
  id: keyof CreateUsuarioFormData
  label: string
  placeholder: string
  required?: boolean
  icon?: React.ReactNode
  type?: string
  form: UseFormReturn<CreateUsuarioFormData>
  className?: string
}

function Field({
  id,
  label,
  placeholder,
  required,
  icon,
  type = 'text',
  form,
  className = ''
}: FieldProps) {
  const error = form.formState.errors[id]

  return (
    <label
      htmlFor={id}
      className={`text-step-0 w-full flex flex-col gap-1 ${className}`}
    >
      <span className='font-semibold flex gap-1 items-center text-gray-700'>
        {icon}
        {label}
        {required && <span className='text-red-500 ml-0.5'>*</span>}
        {!required && (
          <span className='text-xs font-normal text-gray-400 ml-1'>
            (opcional)
          </span>
        )}
      </span>
      <input
        {...form.register(id)}
        id={id}
        type={type}
        placeholder={placeholder}
        className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-0 bg-white ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
            : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600'
        }`}
      />
      {error && (
        <span className='text-red-500 text-xs flex items-center gap-1'>
          <svg
            className='w-3 h-3 shrink-0'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          {error.message as string}
        </span>
      )}
    </label>
  )
}

export default function StepPersona({ form }: StepPersonaProps) {
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
        <Field
          id='ci'
          label='Cédula de Identidad'
          placeholder='12345678'
          required
          icon={<IconCredential />}
          form={form}
        />

        {/* Nombres */}
        <Field
          id='nombres'
          label='Nombres'
          placeholder='Juan Carlos'
          required
          icon={<IconUser />}
          form={form}
        />

        {/* Paterno */}
        <Field
          id='paterno'
          label='Apellido Paterno'
          placeholder='Pérez'
          icon={<IconUser />}
          form={form}
        />

        {/* Materno */}
        <Field
          id='materno'
          label='Apellido Materno'
          placeholder='García'
          icon={<IconUser />}
          form={form}
        />

        {/* Correo - full width */}
        <Field
          id='correo'
          label='Correo electrónico'
          placeholder='usuario@ejemplo.com'
          required
          type='email'
          icon={
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
              />
            </svg>
          }
          form={form}
          className='md:col-span-2'
        />

        {/* Teléfono */}
        <Field
          id='telefono'
          label='Teléfono'
          placeholder='71234567'
          type='tel'
          icon={
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
              />
            </svg>
          }
          form={form}
        />

        {/* Dirección */}
        <Field
          id='direccion'
          label='Dirección'
          placeholder='Av. Arce #123, La Paz'
          icon={
            <svg
              className='w-4 h-4'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          }
          form={form}
        />
      </div>
    </div>
  )
}
