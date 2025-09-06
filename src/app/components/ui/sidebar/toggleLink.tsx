'use client'

import { useState, useRef, useEffect } from 'react'
import { IconArrowDown, IconArrowUp } from '../../icons/icons'
import NavLink from './navLink'

interface Option {
  label: string
  icon: string
  link: string
}

export interface ToggleLinkProps {
  label: string
  options: Option[]
}

export default function ToggleLink({ label, options }: ToggleLinkProps) {
  const [openMenu, setOpenMenu] = useState(true)
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      setMeasuredHeight(contentRef.current.scrollHeight)
    }
  }, [options])

  const toggleMenu = () => setOpenMenu(!openMenu)

  return (
    <div>
      <button
        onClick={toggleMenu}
        className='w-full text-left px-2 py-2 rounded flex justify-between items-center text-secondary-300 cursor-pointer'
        aria-expanded={openMenu}
        aria-controls='toggle-menu-content'
      >
        {label}
        <span className='ml-2'>
          {openMenu ? <IconArrowUp /> : <IconArrowDown />}
        </span>
      </button>

      <div
        id='toggle-menu-content'
        ref={contentRef}
        style={{
          maxHeight: openMenu ? (measuredHeight ?? 0) : 0,
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
          />
        ))}
      </div>
    </div>
  )
}
