'use client'

import useSidebar from '@/hooks/useSidebar'
import ToggleLink from './toggleLink'
import useProfileRoutes from '@/hooks/useProfileRoutes'
import { getPermissions } from '@/app/utils'

export default function Sidebar() {
  const { sidebarMenu } = useSidebar()
  const { routes } = useProfileRoutes()
  const permissions = getPermissions(routes)

  // const permissions = [
  //   {
  //     icon: 'principal',
  //     label: 'Principal',
  //     options: [
  //       {
  //         icon: 'home',
  //         label: 'Inicio',
  //         link: '/dashboard'
  //       },
  //       {
  //         icon: 'user',
  //         label: 'Perfil',
  //         link: '/dashboard/perfil'
  //       },
  //       {
  //         icon: 'bell',
  //         label: 'Notificaciones',
  //         link: '/dashboard/notificaciones'
  //       }
  //     ]
  //   },
  //   // Módulo para Doctor de Fichas
  //   {
  //     icon: 'clipboard',
  //     label: 'Gestión de Fichas',
  //     options: [
  //       // {
  //       //   icon: 'plus',
  //       //   label: 'Registrar Nueva Ficha',
  //       //   link: '/fichas/registrar'
  //       // },
  //       // {
  //       //   icon: 'list',
  //       //   label: 'Listado de Fichas',
  //       //   link: '/fichas/listado'
  //       // },
  //       // {
  //       //   icon: 'calendar',
  //       //   label: 'Reorganizar Fichas',
  //       //   link: '/fichas/reorganizar'
  //       // },
  //       {
  //         icon: 'plus',
  //         label: 'Gestionar Fichas',
  //         link: '/dashboard/fichas/'
  //       },
  //       {
  //         icon: 'message',
  //         label: 'Chat con Pacientes',
  //         link: '/dashboard/fichas/chats'
  //       }
  //     ]
  //   },
  //   // Módulo para Doctores (Médico General, Odontólogo, etc.)
  //   {
  //     icon: 'stethoscope',
  //     label: 'Atención Médica',
  //     options: [
  //       {
  //         icon: 'list',
  //         label: 'Pacientes Atendidos',
  //         link: '/atencion/pacientes'
  //       },
  //       {
  //         icon: 'vaccine',
  //         label: 'Esquemas de Vacunación',
  //         link: '/atencion/vacunacion'
  //       },
  //       {
  //         icon: 'monitor',
  //         label: 'Seguimiento Tratamientos',
  //         link: '/atencion/seguimiento'
  //       },
  //       {
  //         icon: 'send',
  //         label: 'Reenviar Notificaciones',
  //         link: '/atencion/notificaciones'
  //       }
  //     ]
  //   },
  //   // Módulo para Administrador
  //   {
  //     icon: 'setting',
  //     label: 'Administración',
  //     options: [
  //       {
  //         icon: 'userPlus',
  //         label: 'Registrar Doctores',
  //         link: '/admin/doctores'
  //       },
  //       {
  //         icon: 'calendar',
  //         label: 'Gestión de Turnos',
  //         link: '/admin/turnos'
  //       },
  //       {
  //         icon: 'schedule',
  //         label: 'Disponibilidades',
  //         link: '/admin/disponibilidades'
  //       },
  //       {
  //         icon: 'medicineBox',
  //         label: 'Gestión de Vacunas',
  //         link: '/admin/vacunas'
  //       },
  //       {
  //         icon: 'team',
  //         label: 'Gestión de Usuarios',
  //         link: '/admin/usuarios'
  //       },
  //       {
  //         icon: 'security',
  //         label: 'Roles y Permisos',
  //         link: '/admin/roles'
  //       }
  //     ]
  //   },
  //   // Módulo para Pacientes
  //   {
  //     icon: 'heart',
  //     label: 'Mi Salud',
  //     options: [
  //       {
  //         icon: 'history',
  //         label: 'Mis Tratamientos',
  //         link: '/dashboard/paciente/tratamientos'
  //       },
  //       {
  //         icon: 'calendar',
  //         label: 'Mis Fichas',
  //         link: '/dashboard/paciente/fichas'
  //       },
  //       {
  //         icon: 'message',
  //         label: 'Chat con Doctora',
  //         link: '/dashboard/paciente/chat'
  //       }
  //     ]
  //   }
  // ]

  return (
    <aside
      className={`
        size-window font-secondary font-semibold py-4
        transition-all shadow-xs shadow-gray-700 bg-primary-800 text-white
        fixed top-[var(--size-header)] z-50 overflow-y-auto
        no-scrollbar
        ${
          sidebarMenu
            ? 'translate-x-0 w-[250px] pointer-events-auto opacity-100'
            : '-translate-x-full w-0 px-0 pointer-events-none opacity-0'
        }
      `}
    >
      {/* Informacion del usuario */}
      <div className='user flex flex-col items-center justify-center gap-2 w-full border-b border-white-100 pb-2 mb-2 px-2'>
        <div className='avatar bg-white-100 p-2 rounded-full size-10 overflow-hidden'>
          <img
            src='/globe.svg'
            alt='Logo del usuario'
            className='w-full h-auto object-contain aspect-square'
          />
        </div>
        <div className='profile text-step-0 leading-4'>
          <h2 className='text-center font-bold'>Juan Perez</h2>
          <h3 className='text-center'>Administrador</h3>
        </div>
      </div>
      {/* Menú principal */}
      <nav className='flex flex-col gap-2 text-step-0 px-2'>
        {permissions?.map(permission => (
          <ToggleLink key={permission.label} {...permission} />
        ))}
      </nav>
    </aside>
  )
}
