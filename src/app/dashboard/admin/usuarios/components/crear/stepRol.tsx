'use client'

import { useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'
import {
  IconAlertCircle,
  IconCalendar,
  IconCircleCheck,
  IconGenderBigender,
  IconUser,
  IconUserCog,
  IconUserHeart,
  IconUserShield
} from '@/app/components/icons/icons'
import { RoleGroups, Roles, RoleType } from '@/lib/constants'
import { FieldInput } from '@/app/components/ui/form/field-input'
import { FieldSelect } from '@/app/components/ui/form/field-select'

interface StepRolProps {
  form: UseFormReturn<CreateUsuarioFormData>
  roles: Array<{ id: string; nombre: string; descripcion?: string | null }>
}

// Íconos por rol
const ROL_ICONS: Record<string, React.ReactNode> = {
  [Roles.ADMINISTRADOR]: <IconUserCog />,
  [Roles.DOCTOR_GENERAL]: <IconUserHeart />,
  [Roles.ENFERMERIA]: <IconUserShield />,
  [Roles.DOCTOR_FICHAS]: <IconUserShield />,
  [Roles.PACIENTE]: <IconUser />
}

const GRUPOS_SANGUINEOS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function StepRol({ form, roles }: StepRolProps) {
  console.log(roles)

  const rolSeleccionado = form.watch('rol_id')
  const rolNombre =
    (roles.find(r => r.id === rolSeleccionado)?.nombre as RoleType) || undefined

  const esDoctor = RoleGroups.DOCTOR.includes(rolNombre as any)
  const esPaciente = rolNombre === Roles.PACIENTE

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
          const icon = ROL_ICONS[rol.nombre] ?? ROL_ICONS[Roles.PACIENTE]

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
                  <IconCircleCheck size='18' />
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
          <IconAlertCircle size='18' />
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
          <FieldInput
            id='matricula'
            label='Matrícula profesional'
            placeholder='MP-12345'
            required
            icon={<IconUserShield />}
            form={form}
          />
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
            <FieldInput
              id='fecha_nacimiento'
              label='Fecha de nacimiento'
              placeholder='dd/mm/yyyy'
              type='date'
              icon={<IconCalendar />}
              form={form}
            />

            {/* Sexo */}
            <FieldSelect
              id='sexo'
              label='Sexo'
              icon={<IconGenderBigender />}
              options={[
                { value: 'M', label: 'Masculino' },
                { value: 'F', label: 'Femenino' },
                { value: 'O', label: 'Otro' }
              ]}
              form={form}
            />

            {/* Grupo sanguíneo */}
            <label
              htmlFor='grupo_sanguineo'
              className='flex flex-col gap-1 text-step-0 md:col-span-2'
            >
              <span className='font-semibold text-gray-700 text-sm'>
                Grupo sanguíneo{' '}
                <span className='text-xs font-normal text-gray-600'>
                  (opcional)
                </span>
              </span>
              <div className='flex flex-wrap gap-2'>
                {GRUPOS_SANGUINEOS.map(g => {
                  const selected = form.watch('grupo_sanguineo') === g
                  return (
                    <button
                      key={g}
                      type='button'
                      onClick={() => form.setValue('grupo_sanguineo', g as any)}
                      className={`px-3 py-1.5 rounded-md border text-sm font-medium transition-all duration-150 cursor-pointer ${
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
