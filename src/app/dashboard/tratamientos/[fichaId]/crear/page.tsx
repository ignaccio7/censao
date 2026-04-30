import prisma from '@/lib/prisma/prisma'
import CrearTratamientoForm from './crear-tratamiento-form'

type Params = Promise<{ fichaId: string }>

export default async function Page({ params }: { params: Params }) {
  // TODO: verificar permisos en esta ruta

  const { fichaId } = await params

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

  // Fetch datos básicos de la ficha para mostrar contexto
  const ficha = await prisma.fichas.findUnique({
    where: { id: fichaId },
    select: {
      id: true,
      orden_turno: true,
      estado: true,
      pacientes: {
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
      },
      disponibilidades: {
        select: {
          doctores_especialidades: {
            select: {
              especialidades: {
                select: { nombre: true }
              }
            }
          }
        }
      }
    }
  })

  if (!ficha) {
    return (
      <main className='font-secondary p-4'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <h2 className='text-step-2 font-bold text-red-700'>
            Ficha no encontrada
          </h2>
          <p className='text-red-600 mt-2'>
            La ficha solicitada no existe o fue eliminada.
          </p>
        </div>
      </main>
    )
  }

  const pacienteNombre =
    `${ficha.pacientes.personas.nombres} ${ficha.pacientes.personas.paterno} ${ficha.pacientes.personas.materno}`.trim()
  const especialidadNombre =
    ficha.disponibilidades?.doctores_especialidades?.especialidades?.nombre

  return (
    <main className='font-secondary'>
      <CrearTratamientoForm
        fichaId={fichaId}
        pacienteNombre={pacienteNombre}
        pacienteCi={ficha.pacientes.personas.ci}
        especialidadNombre={especialidadNombre ?? 'Consultorio general'}
        ordenTurno={ficha.orden_turno}
        vacunas={vacunas}
      />
    </main>
  )
}
