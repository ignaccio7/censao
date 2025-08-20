import { useState } from 'react'
import { IconArrowDown, IconArrowUp } from '../icons'

interface Option {
  name: string
  icon: string
  link: string
}

export interface ToggleLinkProps {
  optionMenu: string
  options: Option[]
}

export default function ToggleLink({ optionMenu, options }: ToggleLinkProps) {
  const [openMenu, setOpenMenu] = useState(false)

  const toggleMenu = () => setOpenMenu(!openMenu)

  return (
    <div>
      <button
        onClick={toggleMenu}
        className='w-full text-left px-2 py-2 rounded flex justify-between items-center hover:bg-secondary-500 transition-all'
      >
        {optionMenu}
        <span className='ml-2'>
          {openMenu ? <IconArrowUp /> : <IconArrowDown />}
        </span>
      </button>

      <div
        style={{
          maxHeight: openMenu ? `${options.length * 40}px` : '0px',
          opacity: openMenu ? 1 : 0,
          transition: 'max-height 0.3s ease, opacity 0.3s ease'
        }}
        className='overflow-hidden'
      >
        {options.map(option => (
          <button
            key={option.name}
            className='block w-full text-left px-6 py-2 hover:bg-secondary-600 rounded'
          >
            {option.name}
          </button>
        ))}
      </div>
    </div>
  )
}
