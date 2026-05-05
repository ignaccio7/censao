'use client'

import { UseFormReturn } from 'react-hook-form'
import { CreateUsuarioFormData } from '../../schemas'
import {
  IconAlertTriangle,
  IconLock,
  IconShieldCheck,
  IconUser
} from '@/app/components/icons/icons'

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
  console.log(values)

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
      <Section title='Datos personales' color='blue' icon={<IconUser />}>
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
        icon={<IconLock />}
      >
        <InfoRow label='Nombre de usuario' value={values.username} />
        <InfoRow label='Contraseña' value='••••••••' />
      </Section>

      {/* Sección 3: Rol */}
      <Section title='Rol asignado' color='orange' icon={<IconShieldCheck />}>
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
        <IconAlertTriangle size='18' />
        <span>
          Al confirmar, se creará el usuario con acceso inmediato al sistema.
          Asegúrese de que los datos sean correctos.
        </span>
      </div>
    </div>
  )
}
