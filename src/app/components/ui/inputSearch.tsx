'use client'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { IconSearch } from '../icons/icons'

export default function InputSearch({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const pathName = usePathname()
  const { replace } = useRouter()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value.trim()
    const params = new URLSearchParams(searchParams)

    if (searchValue) {
      params.set('search', searchValue)
    } else {
      params.delete('search')
    }

    replace(`${pathName}?${params.toString()}`)
  }

  return (
    <search>
      <label
        htmlFor='search'
        className='flex flex-row items-center gap-2 p-2 border border-gray-300 rounded-md focus-within:outline-none focus-within:ring-1 focus-within:ring-primary-600'
      >
        <IconSearch />
        <input
          type='text'
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
