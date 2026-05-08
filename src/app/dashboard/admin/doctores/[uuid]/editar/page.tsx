import Title from '@/app/components/ui/title'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { IconChevronLeft } from '@/app/components/icons/icons'
import prisma from '@/lib/prisma/prisma'
import FormConfigDoctor from './components/formConfigDoctor'

interface Props {
  params: { uuid: string }
}

export default async function ConfigurarDoctorPage({ params }: Props) {
  const { uuid } = await params

  // Cargar doctor con sus especialidades y disponibilidades
  const doctor = await prisma.doctores.findUnique({
    where: { doctor_id: uuid, eliminado_en: null },
    include: {
      personas: {
        select: { ci: true, nombres: true, paterno: true, materno: true }
      },
      doctores_especialidades: {
        where: {
          disponibilidades: {
            some: {
              estado: true,
              eliminado_en: null
            }
          }
        },
        include: {
          especialidades: {
            select: { id: true, nombre: true, estado: true }
          },
          disponibilidades: {
            select: {
              id: true,
              turno_codigo: true,
              cupos: true,
              estado: true
            }
          }
        }
      }
    }
  })

  if (!doctor) {
    notFound()
  }

  console.log(doctor)

  // Especialidades activas para nuevas asignaciones
  const especialidades = await prisma.especialidades.findMany({
    where: { eliminado_en: null, estado: true },
    select: { id: true, nombre: true },
    orderBy: { nombre: 'asc' }
  })

  // Turnos del catálogo
  const turnos = await prisma.turnos_catalogo.findMany({
    select: { codigo: true, nombre: true },
    orderBy: { hora_inicio: 'asc' }
  })

  // Preparar defaultValues para el formulario
  const defaultValues = {
    matricula: doctor.matricula ?? '',
    especialidades: doctor.doctores_especialidades.map(de => ({
      especialidad_id: de.especialidad_id,
      disponibilidades: de.disponibilidades.map(d => ({
        turno_codigo: d.turno_codigo,
        cupos: d.cupos,
        estado: d.estado
      }))
    }))
  }

  console.log(defaultValues)

  const nombreCompleto = [
    doctor.personas.nombres,
    doctor.personas.paterno ?? '',
    doctor.personas.materno ?? ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <main className='pb-8'>
      <div className='flex items-center gap-2 mb-1'>
        <Link
          href='/dashboard/admin/doctores'
          className='text-gray-400 hover:text-gray-600 transition-colors'
        >
          <IconChevronLeft />
        </Link>
        <Title subtitle={`${nombreCompleto} · CI: ${doctor.doctor_id}`}>
          Configurar doctor
        </Title>
      </div>

      <FormConfigDoctor
        doctorId={doctor.doctor_id}
        nombreCompleto={nombreCompleto}
        ci={doctor.doctor_id}
        defaultValues={defaultValues}
        especialidadesDisponibles={especialidades}
        turnosDisponibles={turnos}
      />
    </main>
  )
}
