'use client'

import { useState } from 'react'
import Modal from '@/app/components/ui/modal/modal'
import {
  IconEye,
  IconUser,
  IconLock,
  IconShieldCheck
} from '@/app/components/icons/icons'
import { RoleType, RoleValue } from '@/lib/constants'

// Define the shape of the user object as passed from the parent
// It matches the return type from UserssService.getAllUsers
interface ViewUserSummaryProps {
  usuario: any // Replace with proper type if available
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

export default function ViewUserSummary({ usuario }: ViewUserSummaryProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!usuario) return null

  // Process role names
  const roles = usuario.usuarios_roles
    ?.map(
      (ur: any) => RoleValue[ur.roles.nombre as RoleType] || ur.roles.nombre
    )
    .join(', ')

  return (
    <>
      <button
        type='button'
        title='Ver resumen'
        onClick={() => setIsOpen(true)}
        className='px-2 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium shadow-sm cursor-pointer'
      >
        <IconEye />
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title='Resumen del usuario'
        maxWidth='lg'
      >
        <div className='space-y-5 font-secondary'>
          <Section title='Datos personales' color='blue' icon={<IconUser />}>
            <InfoRow label='Cédula' value={usuario.persona_ci} />
            <InfoRow label='Nombres' value={usuario.personas?.nombres} />
            <InfoRow
              label='Apellido Paterno'
              value={usuario.personas?.paterno}
            />
            <InfoRow
              label='Apellido Materno'
              value={usuario.personas?.materno}
            />
            <div className='col-span-2'>
              <InfoRow label='Correo' value={usuario.personas?.correo} />
            </div>
            <InfoRow label='Teléfono' value={usuario.personas?.telefono} />
            <div className='col-span-2'>
              <InfoRow label='Dirección' value={usuario.personas?.direccion} />
            </div>
          </Section>

          <Section
            title='Credenciales de acceso'
            color='purple'
            icon={<IconLock />}
          >
            <InfoRow label='Nombre de usuario' value={usuario.username} />
            <InfoRow
              label='Estado'
              value={usuario.activo ? 'Activo' : 'Inactivo'}
            />
          </Section>

          <Section
            title='Rol asignado'
            color='orange'
            icon={<IconShieldCheck />}
          >
            <div className='col-span-2'>
              <InfoRow label='Roles' value={roles} />
            </div>
          </Section>

          <div className='flex justify-end pt-2'>
            <button
              onClick={() => setIsOpen(false)}
              className='px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors cursor-pointer'
            >
              Cerrar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
