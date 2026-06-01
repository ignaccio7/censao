import prisma from '@/lib/prisma/prisma'
import CrearTratamientoForm from './crear-tratamiento-form'

type Params = Promise<{ fichaId: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Page({
  params,
  searchParams
}: {
  params: Params
  searchParams: SearchParams
}) {
  // fichaId aquí en realidad es el paciente_id (CI)
  // Mantenemos el nombre del param dinámico por compatibilidad de rutas TODO: urgente cambiar
  const { fichaId: rawPacienteId } = await params
  const pacienteId = decodeURIComponent(rawPacienteId)
  const { ficha: fichaOrigenId } = await searchParams

  // Server Component: fetch vacunas con esquema_dosis directamente con Prisma
  const vacunas = await prisma.vacunas.findMany({
    where: { eliminado_en: null },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      fabricante: true,
      esquema_dosis: {
        where: { eliminado_en: null },
        orderBy: { numero: 'asc' },
        select: {
          id: true,
          numero: true,
          intervalo_dias: true,
          edad_min_meses: true,
          notas: true
        }
      }
    },
    orderBy: { nombre: 'asc' }
  })

  // Fetch datos básicos del paciente
  const paciente = await prisma.pacientes.findUnique({
    where: { paciente_id: pacienteId },
    select: {
      paciente_id: true,
      personas: {
        select: {
          nombres: true,
          paterno: true,
          materno: true,
          ci: true
        }
      }
    }
  })

  if (!paciente) {
    return (
      <main className='font-secondary p-4'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <h2 className='text-step-2 font-bold text-red-700'>
            Paciente no encontrado
          </h2>
          <p className='text-red-600 mt-2'>
            El paciente solicitado no existe o fue eliminado.
          </p>
        </div>
      </main>
    )
  }

  const pacienteNombre =
    `${paciente.personas.nombres} ${paciente.personas.paterno || ''} ${paciente.personas.materno || ''}`.trim()

  return (
    <main className='font-secondary'>
      <CrearTratamientoForm
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
        pacienteCi={paciente.personas.ci}
        vacunas={vacunas}
        fichaOrigenId={typeof fichaOrigenId === 'string' ? fichaOrigenId : null}
      />
    </main>
  )
}
