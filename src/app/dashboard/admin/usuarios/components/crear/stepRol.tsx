'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'

// interface Rol {
//   id: string
//   nombre: string
//   descripcion?: string
// }

interface StepRolProps {
  form: UseFormReturn<CreateUsuarioFormData>
  roles: Array<{ id: string; nombre: string; descripcion?: string }>
}

// Íconos por rol
const ROL_ICONS: Record<string, React.ReactNode> = {
  ADMINISTRADOR: (
    <svg
      className='w-5 h-5'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
      />
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
      />
    </svg>
  ),
  DOCTOR: (
    <svg
      className='w-5 h-5'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
      />
    </svg>
  ),
  ENFERMERIA: (
    <svg
      className='w-5 h-5'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
      />
    </svg>
  ),
  ADMISION: (
    <svg
      className='w-5 h-5'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
      />
    </svg>
  ),
  PACIENTE: (
    <svg
      className='w-5 h-5'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
      />
    </svg>
  )
}

const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function StepRol({ form, roles }: StepRolProps) {
  const rolSeleccionado = form.watch('rol_id')
  const rolNombre =
    roles.find(r => r.id === rolSeleccionado)?.nombre?.toUpperCase() ?? ''

  const esDoctor = rolNombre.includes('DOCTOR')
  const esPaciente = rolNombre.includes('PACIENTE')

  const errors = form.formState.errors

  // Limpiar campos condicionales al cambiar rol
  useEffect(() => {
    if (!esDoctor) form.setValue('matricula', '')
    if (!esPaciente) {
      form.setValue('fecha_nacimiento', '')
      form.setValue('sexo', undefined)
      form.setValue('grupo_sanguineo', undefined)
    }
  }, [rolSeleccionado, esDoctor, esPaciente, form])

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-bold text-gray-800'>
          Rol y tipo de cuenta
        </h2>
        <p className='text-sm text-gray-500 mt-0.5'>
          Seleccione el rol que tendrá este usuario en el sistema.
        </p>
      </div>

      {/* Selector de roles */}
      <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
        {roles.map(rol => {
          const isSelected = form.watch('rol_id') === rol.id
          const nombreUpper = rol.nombre.toUpperCase()
          const icon = ROL_ICONS[nombreUpper] ?? ROL_ICONS['PACIENTE']

          return (
            <button
              key={rol.id}
              type='button'
              onClick={() =>
                form.setValue('rol_id', rol.id, { shouldValidate: true })
              }
              className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-center ${
                isSelected
                  ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-md'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-primary-300 hover:bg-primary-50/30'
              }`}
            >
              {isSelected && (
                <span className='absolute top-2 right-2'>
                  <svg
                    className='w-4 h-4 text-primary-600'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                      clipRule='evenodd'
                    />
                  </svg>
                </span>
              )}
              <span
                className={isSelected ? 'text-primary-600' : 'text-gray-400'}
              >
                {icon}
              </span>
              <span className='text-xs font-semibold leading-tight'>
                {rol.nombre}
              </span>
            </button>
          )
        })}
      </div>

      {/* Input oculto para validación */}
      <input type='hidden' {...form.register('rol_id')} />
      {errors.rol_id && (
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
          {errors.rol_id.message}
        </span>
      )}

      {/* ── Campos condicionales: DOCTOR ── */}
      {esDoctor && (
        <div className='mt-2 p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3'>
          <p className='text-sm font-semibold text-blue-700 flex items-center gap-2'>
            {ROL_ICONS['DOCTOR']}
            Datos adicionales del Doctor
          </p>
          <label
            htmlFor='matricula'
            className='flex flex-col gap-1 text-step-0'
          >
            <span className='font-semibold text-gray-700 text-sm'>
              Matrícula profesional <span className='text-red-500'>*</span>
            </span>
            <input
              {...form.register('matricula')}
              id='matricula'
              type='text'
              placeholder='MP-12345'
              className={`p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-0 bg-white ${
                errors.matricula
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500 bg-red-50'
                  : 'border-gray-200 focus:border-primary-600 focus:ring-primary-600'
              }`}
            />
            {errors.matricula && (
              <span className='text-red-500 text-xs'>
                {errors.matricula.message}
              </span>
            )}
          </label>
        </div>
      )}

      {/* ── Campos condicionales: PACIENTE ── */}
      {esPaciente && (
        <div className='mt-2 p-4 bg-green-50 border border-green-200 rounded-xl space-y-3'>
          <p className='text-sm font-semibold text-green-700 flex items-center gap-2'>
            {ROL_ICONS['PACIENTE']}
            Datos adicionales del Paciente
            <span className='text-xs font-normal text-green-600'>
              (opcionales)
            </span>
          </p>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            {/* Fecha de nacimiento */}
            <label
              htmlFor='fecha_nacimiento'
              className='flex flex-col gap-1 text-step-0'
            >
              <span className='font-semibold text-gray-700 text-sm'>
                Fecha de nacimiento
              </span>
              <input
                {...form.register('fecha_nacimiento')}
                id='fecha_nacimiento'
                type='date'
                className='p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:border-primary-600 focus:ring-primary-600 transition-colors text-step-0 bg-white'
              />
            </label>

            {/* Sexo */}
            <label htmlFor='sexo' className='flex flex-col gap-1 text-step-0'>
              <span className='font-semibold text-gray-700 text-sm'>Sexo</span>
              <select
                {...form.register('sexo')}
                id='sexo'
                className='p-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:border-primary-600 focus:ring-primary-600 transition-colors text-step-0 bg-white'
              >
                <option value=''>Seleccionar...</option>
                <option value='M'>Masculino</option>
                <option value='F'>Femenino</option>
                <option value='O'>Otro</option>
              </select>
            </label>

            {/* Grupo sanguíneo */}
            <label
              htmlFor='grupo_sanguineo'
              className='flex flex-col gap-1 text-step-0 md:col-span-2'
            >
              <span className='font-semibold text-gray-700 text-sm'>
                Grupo sanguíneo
              </span>
              <div className='flex flex-wrap gap-2'>
                {GRUPOS_SANGUINEOS.map(g => {
                  const selected = form.watch('grupo_sanguineo') === g
                  return (
                    <button
                      key={g}
                      type='button'
                      onClick={() => form.setValue('grupo_sanguineo', g as any)}
                      className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-150 ${
                        selected
                          ? 'bg-primary-600 border-primary-600 text-white'
                          : 'bg-white border-gray-200 text-gray-600 hover:border-primary-300'
                      }`}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
