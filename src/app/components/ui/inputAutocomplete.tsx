'use client'
import { useEffect, useRef, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AutocompleteItem {
  value: string
  label: string
}

interface InputAutocompleteProps {
  id: string
  placeholder?: string
  label?: React.ReactNode
  value: string
  onChange: (value: string) => void
  onSelect: (item: AutocompleteItem) => void
  fetchOptions: (query: string) => Promise<AutocompleteItem[]>
  error?: string
  disabled?: boolean
  className?: string
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function InputAutocomplete({
  id,
  placeholder,
  label,
  value,
  onChange,
  onSelect,
  fetchOptions,
  error,
  disabled = false,
  className = ''
}: InputAutocompleteProps) {
  const [options, setOptions] = useState<AutocompleteItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setActiveIndex(-1)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Búsqueda con debounce
  const search = useDebouncedCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setOptions([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    try {
      const results = await fetchOptions(query)
      setOptions(results)
      setIsOpen(results.length > 0 || query.length >= 2)
    } catch {
      setOptions([])
    } finally {
      setIsLoading(false)
    }
  }, 400)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    onChange(val)
    setActiveIndex(-1)
    if (val.length >= 2) {
      setIsLoading(true)
      search(val)
    } else {
      setOptions([])
      setIsOpen(false)
      setIsLoading(false)
      search.cancel()
    }
  }

  const handleSelect = (item: AutocompleteItem) => {
    onSelect(item)
    setIsOpen(false)
    setOptions([])
    setActiveIndex(-1)
  }

  // Navegación por teclado
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => Math.min(prev + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && options[activeIndex]) {
        handleSelect(options[activeIndex])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setActiveIndex(-1)
    }
  }

  const baseInputClass = `p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors text-step-1 w-full ${
    error
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
      : 'border-transparent focus:border-primary-600 focus:ring-primary-600'
  } disabled:opacity-60 disabled:cursor-not-allowed`

  const showNoResults =
    isOpen && !isLoading && options.length === 0 && value.length >= 2

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Label */}
      {label && (
        <label
          htmlFor={id}
          className='font-semibold flex gap-1 items-center mb-1'
        >
          {label}
        </label>
      )}

      {/* Input con spinner inline */}
      <div className='relative'>
        <input
          ref={inputRef}
          id={id}
          type='text'
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete='off'
          aria-autocomplete='list'
          // eslint-disable-next-line @typescript-eslint/no-role-supports-aria-props
          aria-expanded={isOpen}
          aria-controls={`${id}-listbox`}
          aria-activedescendant={
            activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
          }
          className={baseInputClass}
        />
        {/* Spinner */}
        {isLoading && (
          <div className='absolute right-2 top-1/2 -translate-y-1/2'>
            <div className='animate-spin h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full' />
          </div>
        )}
      </div>

      {/* Error */}
      {error && <span className='text-red-500 text-sm mt-1'>{error}</span>}

      {/* Dropdown */}
      {(isOpen || showNoResults) && (
        <ul
          id={`${id}-listbox`}
          role='listbox'
          className='absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-52 overflow-y-auto'
        >
          {showNoResults ? (
            <li className='px-3 py-2 text-sm text-gray-400 select-none'>
              Sin resultados para &quot;{value}&quot;
            </li>
          ) : (
            options.map((item, index) => (
              <li
                key={item.value}
                id={`${id}-option-${index}`}
                role='option'
                aria-selected={index === activeIndex}
                onMouseDown={e => {
                  // mousedown en lugar de click para que no dispare el onBlur del input antes
                  e.preventDefault()
                  handleSelect(item)
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`px-3 py-2 text-sm cursor-pointer transition-colors duration-100 flex flex-col ${
                  index === activeIndex
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className='font-medium'>{item.value}</span>
                <span className='text-xs text-gray-500 truncate'>
                  {item.label}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
