import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import Title from '@/app/components/ui/title'
import { ConsultasService } from '@/services/consultas'
import prisma from '@/lib/prisma/prisma'
import Link from 'next/link'
import { IconChevronLeft, IconCheckupList } from '@/app/components/icons/icons'
import Pagination from '@/app/components/ui/pagination'
import InputSearch from '@/app/components/ui/inputSearch'
import PacienteCard from '../components/pacienteCard'
import AccionesRapidas from '../components/accionesRapidas'
import ConsultasTable from '../components/consultasTable'
import { StateRecordType } from '@/lib/constants'

export default async function ResumenClinicoPage({
  params,
  searchParams
}: {
  params: Promise<{ fichaId: string }>
  searchParams?: Promise<{ search?: string; page?: string }>
}) {
  const { fichaId } = await params

  // Validar permisos
  const validation = await AuthService.validateApiPermission(
    '/api/consultas',
    'GET'
  )
  if (!validation.success) {
    redirect('/dashboard')
  }

  // 1. Obtener la ficha para sacar el paciente_id
  const ficha = await prisma.fichas.findUnique({
    where: { id: fichaId, eliminado_en: null },
    include: {
      pacientes: {
        include: {
          personas: true
        }
      },
      disponibilidades: {
        include: {
          doctores_especialidades: {
            include: {
              especialidades: true
            }
          }
        }
      }
    }
  })

  if (!ficha) {
    return (
      <div className='p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100'>
        <h3 className='text-xl font-bold mb-2'>Ficha no encontrada</h3>
        <Link
          href='/dashboard/fichas'
          className='mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded-lg'
        >
          Volver a fichas
        </Link>
      </div>
    )
  }

  // 2. Parámetros de búsqueda y paginación
  const sParams = await searchParams
  const search = sParams?.search ?? ''
  const page = Number(sParams?.page) || 1
  const numberPerPage = 5

  const pacienteCi = ficha.pacientes.paciente_id

  // 3. Obtener consultas
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

  const especialidadNombre =
    ficha.disponibilidades?.doctores_especialidades?.especialidades?.nombre ||
    'General'

  console.log(ficha)
  console.log(consultas)

  return (
    <main className='pb-8 animate-fade-in'>
      <div className='flex items-center gap-2 mb-4'>
        <Link
          href='/dashboard/fichas'
          className='text-primary-600 hover:text-primary-800 transition-colors font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 w-fit'
        >
          <IconChevronLeft />
          Volver a Fichas
        </Link>
      </div>

      <Title
        subtitle={`Ficha #${ficha.orden_turno || '—'} · ${especialidadNombre}`}
      >
        Resumen Clínico
      </Title>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6'>
        {/* Cabecera: Info + Acciones */}
        <div className='lg:col-span-2 space-y-6'>
          <PacienteCard paciente={ficha.pacientes} />
        </div>
        <div className='lg:col-span-1 space-y-6'>
          <AccionesRapidas
            fichaId={fichaId}
            estadoFicha={ficha.estado as StateRecordType}
          />
        </div>

        {/* Cuerpo: Historial */}
        <div className='lg:col-span-3'>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
              <div>
                <h3 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                  <IconCheckupList className='text-primary-600' size='22' />
                  Historial de Consultas
                </h3>
                <p className='text-sm text-gray-500 mt-1'>
                  {totalResults} consulta(s) registrada(s)
                </p>
              </div>

              <div className='w-full sm:w-auto'>
                <InputSearch
                  placeholder='Buscar por motivo...'
                  className='w-full sm:w-64'
                />
              </div>
            </div>

            <ConsultasTable consultas={consultas} fichaId={fichaId} />

            {totalPages > 0 && (
              <div className='flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-gray-100 gap-4'>
                <p className='text-sm text-gray-500 italic'>
                  Mostrando página {page} de {totalPages}
                </p>
                <Pagination totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
