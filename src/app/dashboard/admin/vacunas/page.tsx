import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import InputSearch from '@/app/components/ui/inputSearch'
import Pagination from '@/app/components/ui/pagination'
import SkeletonTable from '@/app/components/ui/skeletons/skeletonTable'
import VacunasTable from './components/vacunasTable'
import { IconVaccine } from '@/app/components/icons/icons'
import { VacunasService } from '@/services/vacunas'

export default async function VacunasPage({
  searchParams
}: {
  searchParams?: { search?: string; page?: string }
}) {
  const validation = await AuthService.validateApiPermission(
    '/api/admin/vacunas',
    'GET'
  )
  if (!validation.success) redirect('/dashboard')

  const params = await searchParams
  const search = params?.search ?? ''
  const page = Number(params?.page) || 1
  const numberPerPage = 10

  const total = await VacunasService.countVacunas({ search })
  const totalPages = Math.ceil(total / numberPerPage)

  return (
    <main className='pb-8'>
      <Title subtitle='Gestiona las vacunas y sus esquemas de dosis.'>
        Vacunas del sistema
      </Title>

      <section className='flex gap-2 items-center justify-between flex-wrap-reverse mb-4'>
        <InputSearch
          placeholder='Buscar por nombre, descripción o fabricante'
          className='grow basis-80'
        />
        <Link
          href='/dashboard/admin/vacunas/crear'
          className='px-2 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer flex flex-row gap-2 items-center basis-40 shrink-0 grow-0'
        >
          <IconVaccine />
          Crear vacuna
        </Link>
      </section>

      <Suspense
        key={`${search}-${page}`}
        fallback={<SkeletonTable columns={5} rows={8} />}
      >
        <VacunasTable
          search={search}
          page={page}
          numberPerPage={numberPerPage}
        />
      </Suspense>

      <div className='flex gap-2 justify-between items-center mt-4'>
        <p className='text-sm text-gray-700 italic'>
          {numberPerPage} registros por página <br />
          Página {page} / {totalPages}
        </p>
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  )
}
