'use client'

import { IconCheck, IconPencil } from '@/app/components/icons/icons'
import { useState, useRef, useEffect } from 'react'

interface CustomInputProfileProps {
  label: string
  initialValue: string
  onSave: (newValue: string) => void
}

export default function CustomInputProfile({
  label,
  initialValue,
  onSave
}: CustomInputProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousValue = useRef(initialValue)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setValue(previousValue.current) // restaurar
      setIsEditing(false)
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    if (value.trim() !== value) {
      onSave(value)
      setValue(value)
    }
  }

  useEffect(() => {
    if (isEditing) {
      previousValue.current = value
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [isEditing])

  return (
    <div className='data-group group relative w-full'>
      <h4 className='font-semibold'>{label}</h4>

      {!isEditing ? (
        <div className='flex items-center justify-between gap-2 w-full md:max-w-xs'>
          <span className='w-full'>{value}</span>
          <button
            className='text-gray-500 cursor-pointer opacity-0 group-hover:opacity-100 transition'
            onClick={() => setIsEditing(true)}
          >
            <IconPencil size='20' className='' />
          </button>
        </div>
      ) : (
        <div className='flex items-center justify-between gap-2 w-full md:max-w-xs'>
          <input
            ref={inputRef}
            type='text'
            defaultValue={value}
            onChange={event => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            className='border rounded px-2 py-1 text-sm w-full'
          />
          <button
            className='text-green-600 cursor-pointer'
            onClick={handleSave}
          >
            <IconCheck size='20' />
          </button>
        </div>
      )}
    </div>
  )
}
