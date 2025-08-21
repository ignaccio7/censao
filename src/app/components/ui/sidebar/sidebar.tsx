'use client'

import useSidebar from '@/hooks/useSidebar'
import ToggleLink from './toggleLink'
import NavLink from './navLink'

export default function Sidebar() {
  const { sidebarMenu } = useSidebar()

  const permissions = [
    {
      icon: 'home',
      label: 'Inicio',
      link: '/dashboard'
    },
    {
      icon: 'user',
      label: 'Perfil',
      link: '/perfil'
    },
    {
      icon: 'bell',
      label: 'Notificaciones',
      link: '/notificaciones'
    },
    // Módulo para Doctor de Fichas
    {
      icon: 'clipboard',
      label: 'Gestión de Fichas',
      options: [
        {
          icon: 'plus',
          label: 'Registrar Nueva Ficha',
          link: '/fichas/registrar'
        },
        {
          icon: 'list',
          label: 'Listado de Fichas',
          link: '/fichas/listado'
        },
        {
          icon: 'calendar',
          label: 'Reorganizar Fichas',
          link: '/fichas/reorganizar'
        },
        {
          icon: 'message',
          label: 'Chat con Pacientes',
          link: '/fichas/chat'
        }
      ]
    },
    // Módulo para Doctores (Médico General, Odontólogo, etc.)
    {
      icon: 'stethoscope',
      label: 'Atención Médica',
      options: [
        {
          icon: 'list',
          label: 'Pacientes Atendidos',
          link: '/atencion/pacientes'
        },
        {
          icon: 'vaccine',
          label: 'Esquemas de Vacunación',
          link: '/atencion/vacunacion'
        },
        {
          icon: 'monitor',
          label: 'Seguimiento Tratamientos',
          link: '/atencion/seguimiento'
        },
        {
          icon: 'send',
          label: 'Reenviar Notificaciones',
          link: '/atencion/notificaciones'
        }
      ]
    },
    // Módulo para Administrador
    {
      icon: 'setting',
      label: 'Administración',
      options: [
        {
          icon: 'userPlus',
          label: 'Registrar Doctores',
          link: '/admin/doctores'
        },
        {
          icon: 'calendar',
          label: 'Gestión de Turnos',
          link: '/admin/turnos'
        },
        {
          icon: 'schedule',
          label: 'Disponibilidades',
          link: '/admin/disponibilidades'
        },
        {
          icon: 'medicineBox',
          label: 'Gestión de Vacunas',
          link: '/admin/vacunas'
        },
        {
          icon: 'team',
          label: 'Gestión de Usuarios',
          link: '/admin/usuarios'
        },
        {
          icon: 'security',
          label: 'Roles y Permisos',
          link: '/admin/roles'
        }
      ]
    },
    // Módulo para Pacientes
    {
      icon: 'heart',
      label: 'Mi Salud',
      options: [
        {
          icon: 'history',
          label: 'Mis Tratamientos',
          link: '/paciente/tratamientos'
        },
        {
          icon: 'calendar',
          label: 'Mis Citas',
          link: '/paciente/citas'
        },
        {
          icon: 'message',
          label: 'Chat con Doctora',
          link: '/paciente/chat'
        }
      ]
    }
  ]

  return (
    <aside
      className={`
        size-window font-secondary font-semibold py-4
        transition-all shadow-xs shadow-gray-700 bg-primary-700 text-white
        fixed top-[var(--size-header)] z-50 overflow-y-auto
        no-scrollbar
        ${
          sidebarMenu
            ? 'translate-x-0 w-[300px] px-2 pointer-events-auto opacity-100'
            : '-translate-x-full w-0 px-0 pointer-events-none opacity-0'
        }
      `}
    >
      {/* Menú principal */}
      <nav className='flex flex-col gap-2 text-step-0'>
        {permissions?.map(permission => {
          const isSubmenu = permission.options
          return isSubmenu ? (
            <ToggleLink key={permission.label} {...permission} />
          ) : (
            <NavLink key={permission.label} {...permission} />
          )
        })}
      </nav>
    </aside>
  )
}
