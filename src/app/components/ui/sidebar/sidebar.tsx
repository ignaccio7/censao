'use client'

import { useState } from 'react'
import useSidebar from '@/hooks/useSidebar'
import ToggleLink from './toggleLink'

export default function Sidebar() {
  const { sidebarMenu } = useSidebar()

  // Estado local para controlar los submenús
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const optionsMenu = [
    {
      icon: 'settings',
      link: 'algo',
      name: 'Configuración1'
    },
    {
      icon: 'settings',
      link: 'algo',
      name: 'Configuración2'
    },
    {
      icon: 'settings',
      link: 'algo',
      name: 'Configuración3'
    },

    {
      icon: 'settings',
      link: 'algo',
      name: 'Configuración4'
    },
    {
      icon: 'settings',
      link: 'algo',
      name: 'Configuración5'
    }
  ]

  const submenuProf = {
    optionMenu: 'Perfil',
    options: optionsMenu
  }

  return (
    <aside
      className={`
        size-window font-secondary font-semibold py-4
        transition-all shadow-xs shadow-gray-700 bg-tertiary-800 text-white
        ${
          sidebarMenu
            ? 'translate-x-0 w-[220px] px-4 pointer-events-auto opacity-100'
            : '-translate-x-full w-0 px-0 pointer-events-none opacity-0'
        }
      `}
    >
      {/* Menú principal */}
      <nav className='flex flex-col gap-2 text-step-0'>
        {/* Link normal */}
        <button className='text-left px-2 py-2 rounded hover:bg-secondary-500 transition'>
          Inicio
        </button>

        <ToggleLink {...submenuProf} />

        {/* Link con submenú */}
        <div>
          <button
            onClick={() => toggleMenu('form')}
            className='w-full text-left px-2 py-2 rounded flex justify-between items-center hover:bg-secondary-500 transition'
          >
            Formularios
            <span className='ml-2'>{openMenu === 'form' ? '▲' : '▼'}</span>
          </button>

          <div
            className={`
              overflow-hidden transition-all duration-300 
              ${openMenu === 'form' ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <button className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'>
              Crear nuevo
            </button>
            <button className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'>
              Ver registros
            </button>
            <button className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'>
              Crear nuevo
            </button>
            <button className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'>
              Ver registros
            </button>
          </div>
        </div>

        {/* Otro con submenú */}
        <div>
          <button
            onClick={() => toggleMenu('settings')}
            className='w-full text-left px-2 py-2 rounded flex justify-between items-center hover:bg-secondary-500 transition'
          >
            Configuración
            <span className='ml-2'>{openMenu === 'settings' ? '▲' : '▼'}</span>
          </button>

          <div
            className={`
              overflow-hidden transition-all duration-300 
              ${openMenu === 'settings' ? 'max-h-10 opacity-100' : 'max-h-0 opacity-0'}
            `}
          >
            <button className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'>
              Perfil
            </button>
            <button className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'>
              Seguridad
            </button>
          </div>
        </div>
      </nav>
    </aside>
  )
}
