import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { IconChevronLeft, IconVaccine } from '@/app/components/icons/icons'
import TratamientoAccordion from './components/TratamientoAccordion'

export default async function DetalleTratamientoVacunaPage({
  params
}: {
  params: Promise<{ uuid: string; vacunaId: string }>
}) {
  const { uuid, vacunaId } = await params

  // Validación de permisos
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos/paciente/:uuid/detalle/:uuid',
    'GET'
  )
  if (!validation.success) {
    redirect('/dashboard')
  }

  // Obtener la información de los tratamientos del paciente para esa vacuna específica
  const paciente = await prisma.pacientes.findUnique({
    where: { paciente_id: uuid, eliminado_en: null },
    include: {
      personas: true,
      tratamientos: {
        where: {
          eliminado_en: null,
          esquema_dosis: {
            vacuna_id: vacunaId
          }
        },
        include: {
          esquema_dosis: {
            include: {
              vacunas: true
            }
          },
          citas: {
            where: { eliminado_en: null },
            orderBy: { fecha_programada: 'asc' }
          }
        }
      }
    }
  })

  if (!paciente) {
    return (
      <div className='p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-100'>
        <h3 className='text-xl font-bold mb-2'>Paciente no encontrado</h3>
        <Link
          href={`/dashboard/atencion/pacientes/${uuid}`}
          className='mt-4 inline-block px-4 py-2 bg-gray-800 text-white rounded-lg'
        >
          Volver a paciente
        </Link>
      </div>
    )
  }

  // Ordenamos los tratamientos por número de dosis (ascendente)
  const tratamientos = paciente.tratamientos.sort(
    (a, b) => (a.esquema_dosis?.numero || 0) - (b.esquema_dosis?.numero || 0)
  )

  const vacunaNombre =
    tratamientos.length > 0
      ? tratamientos[0].esquema_dosis?.vacunas?.nombre
      : 'Vacuna Desconocida'

  return (
    <main className='pb-8 animate-fade-in flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Link
            href={`/dashboard/atencion/pacientes/${uuid}`}
            className='text-primary-600 hover:text-primary-800 transition-colors font-semibold flex items-center gap-1 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100 hover:bg-primary-100 w-fit'
          >
            <IconChevronLeft />
            Volver al Paciente
          </Link>
        </div>
      </div>

      {/* Cabecera Principal */}
      <div className='bg-gradient-to-r from-emerald-600 to-emerald-800 rounded-2xl shadow-sm border border-emerald-900/20 overflow-hidden text-white p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h2 className='text-2xl sm:text-3xl font-bold flex items-center gap-2.5'>
            <IconVaccine size='28' />
            Historial de {vacunaNombre}
          </h2>
          <p className='text-emerald-100 mt-2 text-sm sm:text-base opacity-90'>
            Paciente:{' '}
            <span className='font-semibold text-white'>
              {paciente.personas.nombres} {paciente.personas.paterno}
            </span>
          </p>
        </div>
        <div className='bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20 text-center'>
          <p className='text-xs text-emerald-100 font-bold uppercase tracking-wider mb-0.5'>
            Total Dosis
          </p>
          <p className='text-2xl font-black'>{tratamientos.length}</p>
        </div>
      </div>

      {/* Lista de Acordeones */}
      <div className='flex flex-col gap-4'>
        {tratamientos.map((t: any) => (
          <TratamientoAccordion key={t.id} tratamiento={t} pacienteId={uuid} />
        ))}
        {tratamientos.length === 0 && (
          <div className='text-center p-12 bg-white rounded-2xl border border-gray-200 text-gray-500'>
            No se encontraron detalles para este tratamiento.
          </div>
        )}
      </div>
    </main>
  )
}
