'use client'

import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'

interface StepResumenProps {
  form: UseFormReturn<CreateUsuarioFormData>
  rolNombre?: string
}

function InfoRow({
  label,
  value,
  empty = 'No especificado'
}: {
  label: string
  value?: string | null
  empty?: string
}) {
  return (
    <div className='flex flex-col gap-0.5'>
      <span className='text-xs text-gray-400 font-medium uppercase tracking-wide'>
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${value ? 'text-gray-800' : 'text-gray-400 italic font-normal'}`}
      >
        {value || empty}
      </span>
    </div>
  )
}

function Section({
  title,
  icon,
  children,
  color = 'blue'
}: {
  title: string
  icon: React.ReactNode
  children: React.ReactNode
  color?: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50',
    purple: 'border-purple-200 bg-purple-50',
    green: 'border-green-200 bg-green-50',
    orange: 'border-orange-200 bg-orange-50'
  }
  const titleColors = {
    blue: 'text-blue-700',
    purple: 'text-purple-700',
    green: 'text-green-700',
    orange: 'text-orange-700'
  }

  return (
    <div className={`p-4 rounded-xl border ${colors[color]}`}>
      <p
        className={`text-sm font-bold mb-3 flex items-center gap-2 ${titleColors[color]}`}
      >
        {icon}
        {title}
      </p>
      <div className='grid grid-cols-2 gap-3'>{children}</div>
    </div>
  )
}

export default function StepResumen({ form, rolNombre }: StepResumenProps) {
  const values = form.getValues()

  const SEXO_MAP: Record<string, string> = {
    M: 'Masculino',
    F: 'Femenino',
    O: 'Otro'
  }

  const esDoctor = rolNombre?.toUpperCase().includes('DOCTOR')
  const esPaciente = rolNombre?.toUpperCase().includes('PACIENTE')

  return (
    <div className='space-y-5'>
      <div>
        <h2 className='text-lg font-bold text-gray-800'>Resumen del usuario</h2>
        <p className='text-sm text-gray-500 mt-0.5'>
          Verifique los datos antes de confirmar. Una vez creado, podrá
          editarlos desde la lista de usuarios.
        </p>
      </div>

      {/* Sección 1: Datos personales */}
      <Section
        title='Datos personales'
        color='blue'
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
              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            />
          </svg>
        }
      >
        <InfoRow label='Cédula' value={values.ci} />
        <InfoRow label='Nombres' value={values.nombres} />
        <InfoRow label='Apellido Paterno' value={values.paterno} />
        <InfoRow label='Apellido Materno' value={values.materno} />
        <InfoRow label='Correo' value={values.correo} />
        <InfoRow label='Teléfono' value={values.telefono} />
        <div className='col-span-2'>
          <InfoRow label='Dirección' value={values.direccion} />
        </div>
      </Section>

      {/* Sección 2: Credenciales */}
      <Section
        title='Credenciales de acceso'
        color='purple'
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
              d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
            />
          </svg>
        }
      >
        <InfoRow label='Nombre de usuario' value={values.username} />
        <InfoRow label='Contraseña' value='••••••••' />
      </Section>

      {/* Sección 3: Rol */}
      <Section
        title='Rol asignado'
        color='orange'
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
              d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
            />
          </svg>
        }
      >
        <div className='col-span-2'>
          <InfoRow label='Rol' value={rolNombre ?? 'No seleccionado'} />
        </div>

        {esDoctor && (
          <div className='col-span-2'>
            <InfoRow label='Matrícula profesional' value={values.matricula} />
          </div>
        )}

        {esPaciente && (
          <>
            <InfoRow
              label='Fecha de nacimiento'
              value={
                values.fecha_nacimiento
                  ? new Date(values.fecha_nacimiento).toLocaleDateString(
                      'es-BO'
                    )
                  : undefined
              }
            />
            <InfoRow
              label='Sexo'
              value={values.sexo ? SEXO_MAP[values.sexo] : undefined}
            />
            <InfoRow label='Grupo sanguíneo' value={values.grupo_sanguineo} />
          </>
        )}
      </Section>

      {/* Aviso final */}
      <div className='flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs'>
        <svg
          className='w-4 h-4 shrink-0 mt-0.5'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
            clipRule='evenodd'
          />
        </svg>
        <span>
          Al confirmar, se creará el usuario con acceso inmediato al sistema.
          Asegúrese de que los datos sean correctos.
        </span>
      </div>
    </div>
  )
}
