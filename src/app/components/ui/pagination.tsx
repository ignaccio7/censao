'use client'

import { usePathname, useSearchParams } from 'next/navigation'
import { IconLeft, IconRight } from '../icons/icons'
import { generatePagination } from '@/app/api/lib/utils'
import Link from 'next/link'

export default function Pagination({ totalPages }: { totalPages: number }) {
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
      <PaginationArrow
        direction='left'
        href={createPageURL(currentPage - 1)}
        isDisabled={currentPage === 1}
      />

      {allPages.map((page, index) => (
        <PaginationNumber
          key={`${page}-${index}`}
          href={createPageURL(page)}
          isActive={page === currentPage}
          isDisabled={page === currentPage || isNaN(Number(page))}
          page={page}
        />
      ))}

      <PaginationArrow
        direction='right'
        href={createPageURL(currentPage + 1)}
        isDisabled={currentPage === totalPages}
      />
    </nav>
  )
}

function PaginationNumber({
  page,
  isActive,
  href,
  isDisabled
}: {
  page: number | string
  isActive: boolean
  href: string
  isDisabled: boolean
}) {
  return (
    <div
      className={`grid items-center justify-center rounded-md overflow-hidden ${isDisabled || isActive ? 'cursor-not-allowed pointer-events-none' : 'cursor-pointer pointer-events-auto'}`}
    >
      <Link
        href={href}
        aria-current={isActive}
        className={`p-2 transition-colors duration-300 text-center w-10 h-10
        ${
          isActive
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 text-black hover:bg-primary-600 hover:text-white'
        }
        `}
      >
        {page}
      </Link>
    </div>
  )
}

function PaginationArrow({
  direction,
  isDisabled,
  href
}: {
  direction: 'left' | 'right'
  isDisabled: boolean
  href: string
}) {
  return (
    <div
      className={`grid items-center justify-center rounded-md overflow-hidden ${isDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'opacity-100 cursor-pointer pointer-events-auto'}`}
    >
      <Link
        href={href}
        className='bg-gray-200 p-2 hover:bg-primary-600 hover:text-white transition-colors duration-300 w-10 h-10'
      >
        {direction === 'left' ? <IconLeft /> : <IconRight />}
      </Link>
    </div>
  )
}
