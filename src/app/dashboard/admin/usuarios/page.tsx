import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import UsersTable from './components/UsersTable'
import Pagination from '@/app/components/ui/pagination'
import InputSearch from '@/app/components/ui/inputSearch'
import { Suspense } from 'react'
import SkeletonTable from '@/app/components/ui/SkeletonTable'

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

  return (
    <main className='pb-8'>
      <Title subtitle='Gestiona los usuarios que se han registrado en el sistema.'>
        Usuarios del sistema
      </Title>

      <section className='filters'>
        <InputSearch placeholder='Buscar por nombre o usuario en el sistema' />
      </section>

      <Suspense key={search} fallback={<SkeletonTable columns={5} rows={5} />}>
        <UsersTable search={search} />
      </Suspense>

      <Pagination totalPages={10} />
    </main>
  )
}
