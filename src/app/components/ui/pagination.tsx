'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { IconLeft, IconRight } from '../icons/icons'
import { generatePagination } from '@/app/api/lib/utils'
import Link from 'next/link'

export default function Pagination({
  totalPages = 10
}: {
  totalPages: number
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page') || '1')
  const allPages = generatePagination(currentPage, totalPages)

  const createPageURL = (page: number | string) => {
    const params = new URLSearchParams(searchParams)

    if (page === '...') {
      return '#'
    }

    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', page.toString())
    }

    return `${pathname}${params ? `?${params.toString()}` : ''}`
  }

  return (
    <nav
      aria-label='Page navigation'
      className='flex flex-row gap-2 items-center'
    >
      <Link
        href={createPageURL(currentPage - 1)}
        className='cursor-pointer bg-gray-200 p-2 rounded-md hover:bg-gray-400 transition-colors duration-300 w-10 h-10'
      >
        <IconLeft />
      </Link>

      {allPages.map((page, index) => (
        <Link
          key={`page-${index}`}
          href={createPageURL(page)}
          aria-current={page === currentPage}
          className='cursor-pointer bg-gray-200 p-2 rounded-md hover:bg-gray-400 transition-colors duration-300 text-center w-10 h-10'
        >
          {page}
        </Link>
      ))}

      <Link
        href={createPageURL(currentPage + 1)}
        className='cursor-pointer bg-gray-200 p-2 rounded-md hover:bg-gray-400 transition-colors duration-300 w-10 h-10'
      >
        <IconRight />
      </Link>
    </nav>
  )
}

// function PaginationArrow({
//   direction,
//   isDisabled,
//   href
// }: {
//   direction: 'left' | 'right'
//   isDisabled: boolean
//   href: string
// }) {
//   return
// }
