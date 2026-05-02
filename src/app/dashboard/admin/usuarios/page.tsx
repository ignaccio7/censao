import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import UsersTable from './components/usersTable'
import Pagination from '@/app/components/ui/pagination'
import InputSearch from '@/app/components/ui/inputSearch'
import { Suspense } from 'react'
import SkeletonTable from '@/app/components/ui/skeletons/skeletonTable'
import { UserssService } from '@/services/usuarios'
import { IconUserPlus } from '@/app/components/icons/icons'
import Link from 'next/link'

export default async function UsuariosPage({
  searchParams
}: {
  searchParams?: {
    search?: string
    page?: string
  }
}) {
  // Validar que el usuario tenga permisos para acceder a esta pagina
  const validation = await AuthService.validateApiPermission(
    '/api/admin/usuarios',
    'GET'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const search = params?.search ?? ''
  const page = Number(params?.page) || 1

  console.log(search)
  console.log(page)

  const numberPerPage = 5
  const totalResults = await UserssService.countUsers({ search })
  const totalPages = Math.ceil(totalResults / numberPerPage)

  return (
    <main className='pb-8'>
      <Title subtitle='Gestiona los usuarios que se han registrado en el sistema.'>
        Usuarios del sistema
      </Title>

      <section className='filters w-full flex gap-2 items-center justify-between flex-wrap-reverse mb-4'>
        <InputSearch
          placeholder='Buscar por nombre o usuario en el sistema'
          className='grow basis-80'
        />
        <Link
          href='/dashboard/admin/usuarios/crear'
          className='px-2 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer flex flex-row gap-2 items-center basis-40 shrink-0 grow-0'
        >
          <IconUserPlus />
          Crear usuario
        </Link>
      </section>

      <Suspense
        key={`${search}-${page}`}
        fallback={<SkeletonTable columns={5} rows={5} />}
      >
        <UsersTable search={search} page={page} numberPerPage={numberPerPage} />
      </Suspense>

      <div className='details w-full flex gap-2 justify-between items-center'>
        <p className='text-sm text-gray-700 italic'>
          {numberPerPage} registros por página <br />
          Página {page} / {totalPages}
        </p>
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  )
}
