'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

interface SelectFilterProps {
  paramName: string
  options: { value: string; label: string }[]
  placeholder: string
  className?: string
}

export default function SelectFilter({
  paramName,
  options,
  placeholder,
  className
}: SelectFilterProps) {
  const searchParams = useSearchParams()
  const pathName = usePathname()
  const { replace } = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams)

    if (value) {
      params.set(paramName, value)
    } else {
      params.delete(paramName)
    }

    // Resetear a la primera página al cambiar filtro
    params.delete('page')

    replace(`${pathName}?${params.toString()}`)
  }

  return (
    <select
      value={searchParams.get(paramName) || ''}
      onChange={handleChange}
      className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-600 text-sm bg-white cursor-pointer ${className ?? ''}`}
    >
      <option value=''>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
