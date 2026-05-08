import Title from '@/app/components/ui/title'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import InputSearch from '@/app/components/ui/inputSearch'
import SelectFilter from '@/app/components/ui/selectFilter'
import Pagination from '@/app/components/ui/pagination'
import { Suspense } from 'react'
import SkeletonTable from '@/app/components/ui/skeletons/skeletonTable'
import { DoctoresService } from '@/services/doctores'
import DoctoresTable from './components/doctoresTable'

export default async function DoctoresPage({
  searchParams
}: {
  searchParams?: {
    search?: string
    page?: string
    estado?: string
    especialidad?: string
  }
}) {
  // Validar que el usuario tenga permisos para acceder a esta pagina
  const validation = await AuthService.validateApiPermission(
    '/api/admin/doctores',
    'GET'
  )

  if (!validation.success) {
    redirect('/dashboard')
  }

  const params = await searchParams
  const search = params?.search ?? ''
  const page = Number(params?.page) || 1
  const estado = params?.estado ?? ''
  const especialidad = params?.especialidad ?? ''

  const numberPerPage = 10
  const totalResults = await DoctoresService.countDoctores({
    search,
    estado,
    especialidad: especialidad
  })
  const totalPages = Math.ceil(totalResults / numberPerPage)

  // Especialidades activas para el filtro select
  const especialidades = await DoctoresService.getEspecialidadesActivas()

  return (
    <main className='pb-8'>
      <Title subtitle='Gestiona las especialidades y disponibilidades de los doctores'>
        Doctores registrados en el sistema
      </Title>

      <section className='filters w-full flex gap-2 items-center justify-between flex-wrap-reverse mb-4'>
        <InputSearch
          placeholder='Buscar por nombre o CI'
          className='grow basis-60'
        />
        <div className='flex gap-2 items-center flex-wrap'>
          <SelectFilter
            paramName='estado'
            options={[
              { value: 'completo', label: 'Configuración completa' },
              { value: 'incompleto', label: 'Configuración incompleta' }
            ]}
            placeholder='Todos los estados'
          />
          <SelectFilter
            paramName='especialidad'
            options={especialidades.map(e => ({
              value: e.nombre,
              label: e.nombre
            }))}
            placeholder='Todas las especialidades'
          />
        </div>
      </section>

      <Suspense
        key={`${search}-${page}-${estado}-${especialidad}`}
        fallback={<SkeletonTable columns={6} rows={5} />}
      >
        <DoctoresTable
          search={search}
          page={page}
          numberPerPage={numberPerPage}
          estado={estado}
          especialidad={especialidad}
        />
      </Suspense>

      <div className='details w-full flex gap-2 justify-between items-center'>
        <p className='text-sm text-gray-700 italic'>
          {numberPerPage} registros por página <br />
          Página {page} / {totalPages || 1}
        </p>
        <Pagination totalPages={totalPages} />
      </div>
    </main>
  )
}
