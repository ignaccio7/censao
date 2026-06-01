import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import Title from '@/app/components/ui/title'
import { ConsultasService } from '@/services/consultas'
import Pagination from '@/app/components/ui/pagination'
import InputSearch from '@/app/components/ui/inputSearch'
import ConsultasTable from '@/app/dashboard/consultas/components/consultasTable'
import prisma from '@/lib/prisma/prisma'

export default async function ConsultasPacientePage({
  params,
  searchParams
}: {
  params: Promise<{ pacienteCi: string }>
  searchParams?: Promise<{ search?: string; page?: string }>
}) {
  const { pacienteCi } = await params

  const validation = await AuthService.validateApiPermission(
    '/api/consultas',
    'GET'
  )
  if (!validation.success) {
    redirect('/dashboard')
  }

  const sParams = (await searchParams) || {}
  const search = sParams.search ?? ''
  const page = Number(sParams.page) || 1
  const numberPerPage = 5

  const totalResults = await ConsultasService.countConsultasByPaciente({
    pacienteCi,
    search
  })
  const totalPages = Math.ceil(totalResults / numberPerPage)

  const consultas = await ConsultasService.getConsultasByPaciente({
    pacienteCi,
    search,
    page,
    numberPerPage
  })

  // Obtener datos básicos del paciente para el encabezado
  const paciente = await prisma.pacientes.findUnique({
    where: { paciente_id: pacienteCi },
    include: { personas: true }
  })

  return (
    <main className='pb-8 animate-fade-in'>
      <Title subtitle={`Historial de consultas del paciente ${pacienteCi}`}>
        Consultas —{' '}
        {paciente
          ? `${paciente.personas.nombres} ${paciente.personas.paterno}`
          : pacienteCi}
      </Title>

      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6'>
        <div className='flex items-center justify-between mb-6 gap-4'>
          <div>
            <p className='text-sm text-gray-500'>
              Listado de consultas registradas
            </p>
            <p className='text-xs text-gray-400 mt-1'>
              Solo lectura. No puede crear consultas desde aquí.
            </p>
          </div>
          <div className='w-full sm:w-auto'>
            <InputSearch
              placeholder='Buscar por motivo...'
              className='w-full sm:w-64'
            />
          </div>
        </div>

        <ConsultasTable consultas={consultas} pacienteCi={pacienteCi} />

        {totalPages > 0 && (
          <div className='flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 gap-4'>
            <p className='text-sm text-gray-500 italic'>
              Mostrando página {page} de {totalPages}
            </p>
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </div>
    </main>
  )
}
