import Title from '@/app/components/ui/title'
import Calendar from './components/calendar'
import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'
import { notFound } from 'next/navigation'

export default async function Page() {
  const session = await auth()
  if (!session?.user?.id) return notFound()

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: { persona_ci: true }
  })

  if (!usuario?.persona_ci) return notFound()

  // Buscar las citas asociadas al paciente
  const citas = await prisma.citas.findMany({
    where: {
      paciente_id: usuario.persona_ci,
      estado: {
        in: ['PENDIENTE', 'GENERADA']
      },
      eliminado_en: null
    },
    include: {
      doctores: {
        include: {
          personas: true
        }
      },
      tratamientos: {
        include: {
          esquema_dosis: {
            include: {
              vacunas: true
            }
          }
        }
      }
    }
  })

  // Estructurar para FullCalendar
  const reservationsForUser = citas.map(cita => {
    // Generar la fecha final sumando 30 mins a la programada
    const start = cita.fecha_programada
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 30)

    let title = 'Cita Médica'
    if (cita.tipo === 'VACUNA') {
      const vacunaNombre =
        cita.tratamientos?.esquema_dosis?.vacunas?.nombre ?? 'Vacuna'
      const dosisNum = cita.tratamientos?.esquema_dosis?.numero ?? ''
      title = `${vacunaNombre} ${dosisNum ? `(Dosis ${dosisNum})` : ''}`
    } else {
      title = `Cita de ${cita.tipo.toLowerCase()}`
    }

    return {
      id: cita.id,
      title,
      start: start.toISOString(),
      end: end.toISOString(),
      extendedProps: {
        tipo: cita.tipo,
        estado: cita.estado,
        observaciones: cita.observaciones,
        turno_codigo: cita.turno_codigo,
        doctor: cita.doctores?.personas
          ? `${cita.doctores.personas.nombres} ${cita.doctores.personas.paterno}`
          : 'Doctor no asignado'
      }
    }
  })

  return (
    <section className='fichas font-secondary pb-20'>
      <Title className='mb-4'>Citas programadas</Title>

      <div className='w-full h-auto max-w-5xl'>
        <Calendar events={reservationsForUser} />
      </div>
    </section>
  )
}
