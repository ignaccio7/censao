'use client'

import { useState } from 'react'

interface ToggleSwitchProps {
  active: boolean
  onChange?: (active: boolean) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: {
    on?: string
    off?: string
  }
}

export function ToggleSwitch({
  active,
  onChange,
  disabled = false,
  size = 'md',
  label
}: ToggleSwitchProps) {
  const [isActive, setIsActive] = useState(active)

  const handleClick = () => {
    if (disabled) return

    const newState = !isActive
    setIsActive(newState)
    onChange?.(newState)
  }

  const sizes = {
    sm: {
      switch: 'w-8 h-4',
      circle: 'w-3 h-3',
      translate: 'translate-x-4'
    },
    md: {
      switch: 'w-11 h-6',
      circle: 'w-5 h-5',
      translate: 'translate-x-5'
    },
    lg: {
      switch: 'w-14 h-7',
      circle: 'w-6 h-6',
      translate: 'translate-x-7'
    }
  }

  const currentSize = sizes[size]

  return (
    <div className='flex items-center gap-2'>
      {label?.off && (
        <span
          className={`text-xs ${!isActive ? 'text-gray-700 font-medium' : 'text-gray-400'}`}
        >
          {label.off}
        </span>
      )}

      <button
        type='button'
        onClick={handleClick}
        disabled={disabled}
        className={`
          relative inline-flex items-center rounded-full
          transition-colors duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
          ${currentSize.switch}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isActive ? 'bg-primary-600' : 'bg-gray-300'}
        `}
      >
        <span
          className={`
            inline-block transform rounded-full
            bg-white shadow-md transition-transform duration-200 ease-in-out
            ${currentSize.circle}
            ${isActive ? currentSize.translate : 'translate-x-0.5'}
          `}
        />
      </button>

      {label?.on && (
        <span
          className={`text-xs ${isActive ? 'text-primary-600 font-medium' : 'text-gray-400'}`}
        >
          {label.on}
        </span>
      )}
    </div>
  )
}
