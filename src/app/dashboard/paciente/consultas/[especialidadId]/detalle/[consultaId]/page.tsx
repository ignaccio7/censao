import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'
import { notFound, redirect } from 'next/navigation'
import Title from '@/app/components/ui/title'
import Link from 'next/link'
import {
  IconStethoscope,
  IconCalendar,
  IconRefresh,
  IconChevronLeft,
  IconUserShield
} from '@/app/components/icons/icons'

// Mapeos de colores para los tipos de citas
const colorEstadoCita: Record<string, string> = {
  PENDIENTE: 'bg-blue-600',
  GENERADA: 'bg-emerald-600',
  ABSORBIDA: 'bg-cyan-600',
  CANCELADA: 'bg-red-600',
  ASISTIO: 'bg-teal-600',
  FALTO: 'bg-orange-600'
}

type EventoBase = {
  fecha: string
}

type EventoConsulta = EventoBase & {
  tipo: 'consulta'
  titulo: string
  subtitulo: string
  observaciones: string
  medico: string
}

type EventoCita = EventoBase & {
  tipo: 'cita'
  estado: string
  observaciones: string
}

type EventoFicha = EventoBase & {
  tipo: 'ficha'
  motivo: string
  turno: string
}

type Evento = EventoConsulta | EventoCita | EventoFicha

const formatoBo = (fecha: Date) =>
  fecha.toLocaleDateString('es-BO', { timeZone: 'America/La_Paz' })

export default async function DetalleConsultaPage({
  params
}: {
  params: Promise<{ especialidadId: string; consultaId: string }>
}) {
  const { especialidadId, consultaId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: { persona_ci: true, personas: true }
  })

  if (!usuario?.persona_ci) return notFound()

  // Buscar especialidad
  const especialidad = await prisma.especialidades.findUnique({
    where: { id: especialidadId }
  })
  if (!especialidad) return notFound()

  // Buscar Consulta Raiz
  const consultaRaiz = await prisma.consultas.findUnique({
    where: { id: consultaId },
    include: {
      ficha_origen: {
        include: {
          disponibilidades: {
            include: {
              doctores_especialidades: {
                include: { doctores: { include: { personas: true } } }
              }
            }
          }
        }
      },
      citas: {
        where: { eliminado_en: null },
        include: { ficha_generada: true }
      },
      seguimientos: {
        where: { eliminado_en: null },
        orderBy: { creado_en: 'asc' },
        include: {
          ficha_origen: {
            include: {
              disponibilidades: {
                include: {
                  doctores_especialidades: {
                    include: { doctores: { include: { personas: true } } }
                  }
                }
              }
            }
          },
          citas: {
            where: { eliminado_en: null },
            include: {
              ficha_generada: {
                include: {
                  disponibilidades: { include: { turnos_catalogo: true } }
                }
              }
            }
          }
        }
      }
    }
  })

  if (!consultaRaiz) return notFound()

  // Para organizar el timeline, crearemos un array de "visitas"
  // Visita 0 = Consulta Raiz, Visita 1 = Seguimiento 1, etc.
  const visitas = [consultaRaiz, ...consultaRaiz.seguimientos]

  return (
    <main className='font-secondary pb-16'>
      <div className='mb-8'>
        <Link
          href={`/dashboard/paciente/consultas/${especialidadId}`}
          className='text-primary-600 hover:underline font-semibold flex items-center gap-1'
        >
          <span>
            <IconChevronLeft />
          </span>{' '}
          Volver a consultas de {especialidad.nombre}
        </Link>
      </div>

      <div className='mb-6'>
        <Title>Detalle de Consulta: {consultaRaiz.motivo_consulta}</Title>
        <p className='text-gray-600 font-medium'>
          Especialidad:{' '}
          <span className='font-bold text-sky-700'>{especialidad.nombre}</span>
        </p>
      </div>

      {/* TIMELINE */}
      <div className='relative max-w-5xl mx-auto'>
        {/* Linea vertical de fondo */}
        <div className='absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200 rounded-full hidden md:block'></div>

        {visitas.map((visita, vIndex) => {
          const esRaiz = vIndex === 0

          const doctorPersona =
            visita.ficha_origen?.disponibilidades?.doctores_especialidades
              ?.doctores?.personas
          const nombreDoctor = doctorPersona
            ? `${doctorPersona.nombres} ${doctorPersona.paterno}`
            : 'Doctor no asignado'

          // Generamos los eventos para esta visita en orden cronológico real: Ficha -> Consulta -> Cita
          const eventosVisita: Evento[] = []

          // 1. Ficha origen de esta visita (lado izquierdo)
          eventosVisita.push({
            tipo: 'ficha',
            fecha: formatoBo(visita.ficha_origen.fecha_ficha),
            motivo: visita.ficha_origen.motivo ?? 'Atención médica',
            turno: 'Atención en consultorio'
          })

          // 2. La consulta médica (lado derecho)
          eventosVisita.push({
            tipo: 'consulta',
            fecha: formatoBo(visita.creado_en),
            titulo: esRaiz ? 'Consulta Inicial' : `Seguimiento #${vIndex}`,
            subtitulo: esRaiz
              ? visita.motivo_consulta
              : 'Control / Seguimiento',
            observaciones:
              visita.observaciones ?? 'Sin observaciones registradas',
            medico: nombreDoctor
          })

          // 3. Citas programadas desde esta visita y fichas de esas citas (lado izquierdo)
          for (const cita of visita.citas) {
            eventosVisita.push({
              tipo: 'cita',
              fecha: formatoBo(cita.fecha_programada),
              estado: cita.estado,
              observaciones: cita.observaciones ?? 'Cita programada'
            })

            // Las citas pueden haber generado fichas, las agregamos
            for (const fg of cita.ficha_generada) {
              eventosVisita.push({
                tipo: 'ficha',
                fecha: formatoBo(fg.fecha_ficha),
                motivo: fg.motivo ?? 'Visita por cita',
                turno:
                  fg.disponibilidades?.turnos_catalogo?.nombre ?? 'Programada'
              })
            }
          }

          return (
            <div key={`visita-${vIndex}`} className='mb-8'>
              <div className='flex justify-center my-6'>
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm uppercase tracking-wider border relative z-10 ${esRaiz ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}
                >
                  <IconRefresh className='inline-block mr-1' size='18' />
                  {esRaiz ? 'INICIO DE LA CONSULTA ' : `SEGUIMIENTO #${vIndex}`}
                </span>
              </div>

              <div className='flex flex-col gap-4 md:gap-0 mt-6'>
                {eventosVisita.map((evento, index) => {
                  const esFicha = evento.tipo === 'ficha'
                  const esCita = evento.tipo === 'cita'
                  const esConsulta = evento.tipo === 'consulta'

                  // Fichas y citas a la izquierda; consultas a la derecha
                  const ladoIzquierda = esFicha || esCita

                  let headerColor = 'bg-sky-800' // Por defecto
                  if (esConsulta)
                    headerColor = esRaiz ? 'bg-sky-800' : 'bg-amber-600'
                  if (esFicha) headerColor = 'bg-teal-700'
                  if (esCita) {
                    const c = evento as EventoCita
                    headerColor = colorEstadoCita[c.estado] ?? 'bg-blue-600'
                  }

                  let titulo = ''
                  let subtitulo = ''
                  let descripcion = ''

                  if (esFicha) {
                    const f = evento as EventoFicha
                    titulo = 'Ficha de Atención'
                    subtitulo = `Detalle: ${f.turno}`
                    descripcion = f.motivo
                  } else if (esConsulta) {
                    const c = evento as EventoConsulta
                    titulo = c.titulo
                    subtitulo = c.subtitulo
                    descripcion = c.observaciones
                  } else if (esCita) {
                    const c = evento as EventoCita
                    titulo = 'Cita Programada'
                    subtitulo = c.estado
                    descripcion = c.observaciones
                  }

                  return (
                    <section
                      className='grid grid-cols-1 md:grid-cols-[45%_10%_45%]'
                      key={`evento-${vIndex}-${index}`}
                    >
                      {/* Tarjeta */}
                      <article
                        className={`bg-white rounded-md overflow-hidden shadow-md text-step-1 my-0 md:my-2
                          ${ladoIzquierda ? 'order-1' : 'order-3'}`}
                      >
                        <header
                          className={`${headerColor} text-white p-2 font-bold flex justify-between`}
                        >
                          <span>{titulo}</span>
                        </header>
                        <div className='p-4 text-gray-700 flex flex-col gap-2'>
                          <small className='font-normal text-sm uppercase text-gray-500'>
                            {subtitulo} | {evento.fecha}
                          </small>
                          <p className='font-medium text-[15px]'>
                            {descripcion}
                          </p>

                          {esConsulta && (
                            <p className='text-sm text-gray-500 mt-2 flex items-center gap-1 border-t pt-2'>
                              <span>
                                <IconUserShield />{' '}
                              </span>{' '}
                              Dr. {(evento as EventoConsulta).medico}
                            </p>
                          )}
                        </div>
                      </article>

                      {/* Icono central */}
                      <div className='hidden md:flex justify-center items-center order-2 relative'>
                        <div className='bg-white p-2 rounded-full shadow-md border border-gray-100 z-10'>
                          {esConsulta ? (
                            <IconStethoscope
                              className='text-gray-500'
                              size='24'
                            />
                          ) : (
                            <IconCalendar className='text-gray-500' size='24' />
                          )}
                        </div>
                      </div>

                      {/* Espaciador vacío para el otro lado */}
                      <div
                        className={`hidden md:block ${ladoIzquierda ? 'order-3' : 'order-1'}`}
                      ></div>
                    </section>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
