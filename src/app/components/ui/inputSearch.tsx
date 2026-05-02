'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IconSearch } from '../icons/icons'
import { useDebouncedCallback } from 'use-debounce'

export default function InputSearch({
  placeholder,
  className
}: {
  placeholder: string
  className?: string
}) {
  const searchParams = useSearchParams()
  const pathName = usePathname()
  const { replace } = useRouter()

  const handleSearch = useDebouncedCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const searchValue = e.target.value.trim()
      const params = new URLSearchParams(searchParams)

      if (searchValue) {
        params.set('search', searchValue)
      } else {
        params.delete('search')
      }

      params.delete('page')

      replace(`${pathName}?${params.toString()}`)
    },
    500
  )

  return (
    <search className={`${className}`}>
      <label
        htmlFor='search'
        className='flex flex-row items-center gap-2 p-2 border border-gray-300 rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-primary-600'
      >
        <IconSearch />
        <input
          type='search'
          name='search'
          id='search'
          placeholder={placeholder}
          defaultValue={searchParams.get('search') || ''}
          onChange={handleSearch}
          className='outline-none w-full'
        />
      </label>
    </search>
  )
}
