import { IconCalendar, IconVaccine } from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'
import { notFound } from 'next/navigation'
import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'

export default async function Tratamiento({
  params
}: {
  params: Promise<{ uuid: string }>
}) {
  const { uuid } = await params
  const session = await auth()

  if (!session?.user?.id) {
    return notFound()
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: { persona_ci: true }
  })

  if (!usuario?.persona_ci) return notFound()

  // Buscar la vacuna (uuid representa vacuna_id porque los agrupamos en la lista anterior)
  const vac = await prisma.vacunas.findUnique({
    where: { id: uuid }
  })

  if (!vac) return notFound()

  // Buscar todos los tratamientos (dosis aplicadas) de esta vacuna para este paciente
  const tratamientos = await prisma.tratamientos.findMany({
    where: {
      ficha_origen: { paciente_id: usuario.persona_ci },
      esquema_dosis: { vacuna_id: uuid },
      eliminado_en: null
    },
    include: {
      esquema_dosis: true,
      ficha_origen: {
        include: {
          disponibilidades: {
            include: { turnos_catalogo: true }
          }
        }
      },
      citas: {
        where: { eliminado_en: null }
      }
    },
    orderBy: { fecha_aplicacion: 'asc' }
  })

  if (!tratamientos.length) {
    return (
      <section className='tratamiento font-secondary pb-10 px-4'>
        <Title className='mb-2'>Tratamiento {vac.nombre}</Title>
        <p className='text-gray-600 mt-4 text-center'>
          No tienes historias clínicas ni tratamientos registrados para esta
          vacuna.
        </p>
      </section>
    )
  }

  // Construcción dinámica de la bitácora (timeline)
  const historyEvents = []
  let nroCita = 1

  for (const t of tratamientos) {
    // Evento de "Ficha" (ticket de atención presencial que generó el tratamiento)
    historyEvents.push({
      fecha: t.ficha_origen.fecha_ficha.toISOString().split('T')[0],
      turno:
        t.ficha_origen.disponibilidades?.turnos_catalogo?.nombre || 'General',
      motivo: t.ficha_origen.motivo || 'Visita para registro/vacunación',
      tipo: 'cita',
      nro: nroCita++
    })

    // Evento de "Tratamiento" (la dosis aplicada en sí)
    historyEvents.push({
      fecha: t.fecha_aplicacion.toISOString().split('T')[0],
      estado: t.estado,
      nombre:
        vac.nombre +
        (t.esquema_dosis?.numero ? ` (Dosis ${t.esquema_dosis.numero})` : ''),
      descripcion:
        vac.descripcion || 'Registro documental de la vacuna aplicada.',
      fabricante: vac.fabricante || 'Fabricante no especificado',
      tipo: 'tratamiento'
    })

    // Eventos de "Citas" programadas a partir de este tratamiento (si las hubiera)
    if (t.citas && t.citas.length > 0) {
      for (const c of t.citas) {
        historyEvents.push({
          fecha: c.fecha_programada.toISOString().split('T')[0],
          turno: 'Programada (Futura)',
          motivo:
            c.observaciones || 'Cita de seguimiento o refuerzo programada',
          tipo: 'cita',
          nro: nroCita++
        })
      }
    }
  }

  // Ordenamos globalmente de forma cronológica
  historyEvents.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  return (
    <section className='tratamiento font-secondary pb-10'>
      <Title className='mb-2'>Tratamiento: {vac.nombre}</Title>
      <div className='flex flex-col gap-4 md:gap-0 mt-6'>
        {historyEvents.map((appointment, index) => {
          const isAppointment = appointment.tipo === 'cita'
          const firstTitle = isAppointment
            ? `Visita/Cita #${appointment.nro}`
            : appointment.nombre
          const secondTitle = isAppointment
            ? `Turno: ${appointment.turno}`
            : `Estado: ${appointment.estado}`
          const description = isAppointment
            ? appointment.motivo
            : appointment.descripcion

          return (
            <section
              className='grid grid-cols-1 md:grid-cols-[45%_10%_45%]'
              key={`${appointment.fecha}-${index}`}
            >
              <article
                className={`card-treatment-cite bg-white rounded-md overflow-hidden shadow-md text-step-1 my-0 md:my-2 ${isAppointment ? 'order-1' : 'order-3'}`}
              >
                <h2
                  className={`flex gap-1 items-center capitalize text-white justify-between p-2 font-semibold
                  ${isAppointment ? 'bg-green-900' : 'bg-amber-600'}`}
                >
                  <span className='flex gap-1 items-center'>
                    {isAppointment ? (
                      <IconCalendar className='block md:hidden' />
                    ) : (
                      <IconVaccine className='block md:hidden' />
                    )}
                    {firstTitle}
                  </span>
                  <small className='font-normal text-sm lowercase'>
                    {secondTitle} | Fecha: {appointment.fecha}
                  </small>
                </h2>
                <p className='p-3 text-pretty text-gray-700 min-h-16'>
                  {description}
                </p>
              </article>
              <div className='hidden md:flex justify-center items-center order-2 relative'>
                {isAppointment ? (
                  <IconCalendar
                    className={`absolute z-10 p-2 rounded-full border text-white shadow-sm ${isAppointment ? 'bg-green-800' : 'bg-amber-600'}`}
                    size='44'
                  />
                ) : (
                  <IconVaccine
                    className={`absolute z-10 p-2 rounded-full border text-white shadow-sm hover:scale-110 transition-transform ${isAppointment ? 'bg-green-800' : 'bg-amber-600'}`}
                    size='44'
                  />
                )}
                <div className='h-full border-l-2 border-dashed border-gray-300 w-0' />
              </div>
              <div
                className={`hidden md:block ${isAppointment ? 'order-3' : 'order-1'}`}
              />
            </section>
          )
        })}
      </div>
    </section>
  )
}
