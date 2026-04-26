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

  if (!session?.user?.id) return notFound()

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: { persona_ci: true }
  })

  if (!usuario?.persona_ci) return notFound()

  const vac = await prisma.vacunas.findUnique({
    where: { id: uuid }
  })

  if (!vac) return notFound()

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
        where: { eliminado_en: null },
        include: {
          ficha_generada: {
            include: {
              disponibilidades: {
                include: { turnos_catalogo: true }
              }
            }
          }
        }
      }
    },
    orderBy: { fecha_aplicacion: 'asc' }
  })

  console.log('MIS TRATAMIENTOS SON:')
  console.log(tratamientos)

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

  // ── Tipos ──────────────────────────────────────────────────────────────────
  type EventoFicha = {
    tipo: 'ficha'
    subtipo: 'presencial' | 'programada'
    fecha: string
    turno: string
    motivo: string
    orden: number | null
  }

  type EventoTratamiento = {
    tipo: 'tratamiento'
    fecha: string
    estado: string
    nombre: string
    descripcion: string
    fabricante: string
  }

  type EventoCita = {
    tipo: 'cita'
    fecha: string
    estado: string
    observaciones: string
    tieneFichaGenerada: boolean
  }

  type Evento = EventoFicha | EventoTratamiento | EventoCita

  // ── Construcción del timeline ──────────────────────────────────────────────
  const eventos: Evento[] = []

  for (const t of tratamientos) {
    // 1. Ficha origen (siempre presencial, es la que generó el tratamiento)
    eventos.push({
      tipo: 'ficha',
      subtipo: t.ficha_origen.cita_origen_id ? 'programada' : 'presencial',
      fecha: t.ficha_origen.fecha_ficha.toISOString().split('T')[0],
      turno:
        t.ficha_origen.disponibilidades?.turnos_catalogo?.nombre ?? 'General',
      motivo: t.ficha_origen.motivo ?? 'Visita para control / vacunación',
      orden: t.ficha_origen.orden_turno
    })

    // 2. Tratamiento (dosis aplicada)
    eventos.push({
      tipo: 'tratamiento',
      fecha: t.fecha_aplicacion.toISOString().split('T')[0],
      estado: t.estado,
      nombre:
        vac.nombre +
        (t.esquema_dosis?.numero ? ` — Dosis ${t.esquema_dosis.numero}` : ''),
      descripcion:
        vac.descripcion ?? 'Registro documental de la vacuna aplicada.',
      fabricante: vac.fabricante ?? 'Fabricante no especificado'
    })

    // 3. Citas generadas por este tratamiento
    for (const c of t.citas) {
      // 3a. La cita en sí
      eventos.push({
        tipo: 'cita',
        fecha: c.fecha_programada.toISOString().split('T')[0],
        estado: c.estado,
        observaciones:
          c.observaciones ?? 'Cita de seguimiento o refuerzo programada',
        tieneFichaGenerada: c.ficha_generada.length > 0
      })

      // 3b. Si la cita generó una ficha programada, la agregamos también
      for (const fg of c.ficha_generada) {
        eventos.push({
          tipo: 'ficha',
          subtipo: 'programada',
          fecha: fg.fecha_ficha.toISOString().split('T')[0],
          turno: fg.disponibilidades?.turnos_catalogo?.nombre ?? 'Programada',
          motivo: fg.motivo ?? 'Visita programada por seguimiento',
          orden: fg.orden_turno
        })
      }
    }
  }

  // Orden cronológico global
  eventos.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  )

  // ── Etiquetas de estado de cita ────────────────────────────────────────────
  const etiquetaEstadoCita: Record<string, string> = {
    PENDIENTE: 'Pendiente de atención',
    GENERADA: 'Ficha generada',
    ABSORBIDA: 'Atendida con ficha presencial',
    CANCELADA: 'Cancelada, el doctor reprogramo',
    VENCIDA: 'No asistió — vencida'
  }

  const colorEstadoCita: Record<string, string> = {
    PENDIENTE: 'bg-blue-600',
    GENERADA: 'bg-green-700',
    ABSORBIDA: 'bg-violet-700',
    CANCELADA: 'bg-red-600',
    VENCIDA: 'bg-gray-500'
  }

  return (
    <section className='tratamiento font-secondary pb-10'>
      <Title className='mb-2'>Tratamiento: {vac.nombre}</Title>
      <div className='flex flex-col gap-4 md:gap-0 mt-6'>
        {eventos.map((evento, index) => {
          const esFicha = evento.tipo === 'ficha'
          const esCita = evento.tipo === 'cita'
          const esTratamiento = evento.tipo === 'tratamiento'

          // Fichas y citas van a la izquierda; tratamientos a la derecha
          const ladoIzquierda = esFicha || esCita

          let headerColor = 'bg-green-900'
          if (esTratamiento) headerColor = 'bg-amber-600'
          if (esCita) {
            const c = evento as EventoCita
            headerColor = colorEstadoCita[c.estado] ?? 'bg-[#0099ff]'
          }
          if (esFicha && (evento as EventoFicha).subtipo === 'programada') {
            headerColor = 'bg-teal-700'
          }

          let titulo = ''
          let subtitulo = ''
          let descripcion = ''

          if (esFicha) {
            const f = evento as EventoFicha
            titulo =
              f.subtipo === 'presencial'
                ? 'Visita presencial'
                : 'Visita programada'
            subtitulo = `Turno: ${f.turno}`
            descripcion = f.motivo
          } else if (esTratamiento) {
            const t = evento as EventoTratamiento
            titulo = t.nombre
            subtitulo = `Estado: ${t.estado}`
            descripcion = t.descripcion
          } else if (esCita) {
            const c = evento as EventoCita
            titulo = 'Cita programada'
            subtitulo = etiquetaEstadoCita[c.estado] ?? c.estado
            descripcion = c.observaciones
          }

          return (
            <section
              className='grid grid-cols-1 md:grid-cols-[45%_10%_45%]'
              key={`${evento.fecha}-${index}`}
            >
              {/* Tarjeta */}
              <article
                className={`bg-white rounded-md overflow-hidden shadow-md text-step-1 my-0 md:my-2
                  ${ladoIzquierda ? 'order-1' : 'order-3'}`}
              >
                <h2
                  className={`flex gap-1 items-center text-white justify-between p-2 font-semibold capitalize ${headerColor}`}
                >
                  <span className='flex gap-1 items-center'>
                    {esTratamiento ? (
                      <IconVaccine className='block md:hidden' />
                    ) : (
                      <IconCalendar className='block md:hidden' />
                    )}
                    {titulo}
                  </span>
                  <small className='font-normal text-sm lowercase'>
                    {subtitulo} | {evento.fecha}
                  </small>
                </h2>
                <p className='p-3 text-pretty text-gray-700 min-h-16'>
                  {descripcion}
                </p>
              </article>

              {/* Línea central con ícono */}
              <div className='hidden md:flex justify-center items-center order-2 relative'>
                {esTratamiento ? (
                  <IconVaccine
                    className={`absolute z-10 p-2 rounded-full border text-white shadow-sm ${headerColor}`}
                    size='44'
                  />
                ) : (
                  <IconCalendar
                    className={`absolute z-10 p-2 rounded-full border text-white shadow-sm ${headerColor}`}
                    size='44'
                  />
                )}
                <div className='h-full border-l-2 border-dashed border-gray-300 w-0' />
              </div>

              {/* Celda vacía del lado contrario */}
              <div
                className={`hidden md:block ${ladoIzquierda ? 'order-3' : 'order-1'}`}
              />
            </section>
          )
        })}
      </div>
    </section>
  )
}
