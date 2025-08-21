import { useState } from 'react'
import { IconArrowDown, IconArrowUp } from '../../icons/icons'
import NavLink from './navLink'

interface Option {
  label: string
  icon: string
  link: string
}

export interface ToggleLinkProps {
  label: string
  icon: string
  options: Option[]
}

export default function ToggleLink({ label, options }: ToggleLinkProps) {
  const [openMenu, setOpenMenu] = useState(true)

  const toggleMenu = () => setOpenMenu(!openMenu)

  return (
    <div>
      <button
        onClick={toggleMenu}
        className='w-full text-left px-2 py-2 rounded flex justify-between items-center text-secondary-300 cursor-pointer'
      >
        {label}
        <span className='ml-2'>
          {openMenu ? <IconArrowUp /> : <IconArrowDown />}
        </span>
      </button>

      <div
        style={{
          // oxlint-disable-next-line no-magic-numbers
          maxHeight: openMenu ? `${options.length * 40}px` : '0px',
          // oxlint-disable-next-line no-magic-numbers
          opacity: openMenu ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.3s ease'
        }}
        className='overflow-hidden'
      >
        {options.map(option => (
          <NavLink
            key={option.label}
            label={option.label}
            link={option.link}
            icon={option.icon}
            className='ml-1'
            // className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'
          />
        ))}
      </div>
    </div>
  )
}
