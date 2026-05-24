import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import Pagination from '@/app/components/ui/pagination'
import InputSearch from '@/app/components/ui/inputSearch'
import { Suspense } from 'react'
import SkeletonTable from '@/app/components/ui/skeletons/skeletonTable'
import { IconUserPlus } from '@/app/components/icons/icons'
import Link from 'next/link'
import { PacientesService } from '@/services/pacientes'
import PacientesTableClient from './components/pacientesTableClient'
import { Roles } from '@/lib/constants'

export default async function PacientesPage({
  searchParams
}: {
  searchParams?: {
    search?: string
    page?: string
  }
}) {
  // Validar que el usuario tenga permisos para acceder a esta pagina
  const validation = await AuthService.validateApiPermission(
    '/api/atencion/pacientes',
    'GET'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  const userRole = validation.data?.role
  const userId = validation.data?.id

  const params = await searchParams
  const search = params?.search ?? ''
  const page = Number(params?.page) || 1

  const numberPerPage = 5
  const totalResults = await PacientesService.countPacientes({
    search,
    userId,
    userRole
  })
  console.log(totalResults)

  const totalPages = Math.ceil(totalResults / numberPerPage)

  const pacientes = await PacientesService.getAllPacientes({
    search,
    page,
    numberPerPage,
    userId,
    userRole
  })

  console.log({ userId, userRole })

  console.log(pacientes)

  // Solo DOCTOR_FICHAS o ADMINISTRADOR pueden crear pacientes
  const canCreatePaciente =
    userRole === Roles.DOCTOR_FICHAS || userRole === Roles.ADMINISTRADOR
  // userRole === Roles.ENFERMERIA

  return (
    <main className='pb-8'>
      <Title subtitle='Gestiona los pacientes que has registrado en el centro de salud. Puedes editar sus datos, eliminarlos o revisar su historial de atenciones.'>
        Pacientes Registrados
      </Title>

      <section className='filters w-full flex gap-2 items-center justify-between flex-wrap-reverse mb-4'>
        <InputSearch
          placeholder='Buscar por CI, nombre o apellidos'
          className='grow basis-80'
        />
        {canCreatePaciente && (
          <Link
            href='/dashboard/atencion/pacientes/crear'
            className='px-2 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer flex flex-row gap-2 items-center basis-52 shrink-0 grow-0'
          >
            <IconUserPlus />
            Registrar Paciente
          </Link>
        )}
      </section>

      <Suspense
        key={`${search}-${page}`}
        fallback={<SkeletonTable columns={6} rows={5} />}
      >
        <PacientesTableClient pacientes={pacientes} userRole={userRole} />
      </Suspense>

      <div className='details w-full flex gap-2 justify-between items-center mt-4'>
        <p className='text-sm text-gray-700 italic'>
          {numberPerPage} registros por página <br />
          Página {page} / {totalPages || 1}
        </p>
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  )
}
