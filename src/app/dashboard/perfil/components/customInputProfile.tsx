'use client'

import { IconCheck, IconPencil } from '@/app/components/icons/icons'
import { useState, useRef, useEffect } from 'react'

interface CustomInputProfileProps {
  label: string
  initialValue: string
  onSave: (newValue: string) => void
  readOnly?: boolean
  isEditing?: boolean
}

export default function CustomInputProfile({
  label,
  initialValue,
  onSave,
  readOnly = false,
  isEditing: externalIsEditing
}: CustomInputProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const previousValue = useRef(initialValue)

  // No sincronizamos initialValue con useEffect porque pisaría ediciones
  // en curso del usuario. El padre debe usar `key` para forzar un reset.

  // Permitir control externo del modo edición (FormProfileData habilita todos los campos)
  const editing =
    externalIsEditing !== undefined ? externalIsEditing : isEditing

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editing])

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setValue(previousValue.current)
      setIsEditing(false)
    }
    if (event.key === 'Enter') {
      handleSave()
    }
  }

  const handleSave = () => {
    setIsEditing(false)
    onSave(value)
    setValue(value)
  }

  useEffect(() => {
    if (editing) {
      previousValue.current = value
    }
    // oxlint-disable-next-line exhaustive-deps
  }, [editing])

  // ── Solo lectura: sin botón de edición, visualmente deshabilitado
  if (readOnly) {
    return (
      <div className='data-group w-full'>
        <h4 className='font-semibold'>{label}</h4>
        <div className='flex items-center gap-2 w-full md:max-w-xs'>
          <span className='text-gray-400 w-full'>{value || '—'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className='data-group group relative w-full'>
      <h4 className='font-semibold'>{label}</h4>

      {!editing ? (
        <div className='flex items-center justify-between gap-2 w-full md:max-w-xs'>
          <span className='w-full'>{value || '—'}</span>
          <button
            type='button'
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
            type='button'
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
