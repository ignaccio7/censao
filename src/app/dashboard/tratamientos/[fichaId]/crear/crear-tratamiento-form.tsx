// oxlint-disable no-magic-numbers
'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Title from '@/app/components/ui/title'
import {
  IconVaccine,
  IconArrowDown,
  IconCalendar,
  IconCheck
  // IconAlertTriangle,
  // IconChevronLeft,
  // IconChevronRight
} from '@/app/components/icons/icons'
import { useTratamientos } from '@/app/services/tratamientos'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import Modal from '@/app/components/ui/modal/modal'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { es } from 'react-day-picker/locale'

// ── Types ──
type EsquemaDosis = {
  id: string
  numero: number
  intervalo_dias: number
  edad_min_meses: number | null
  notas: string | null
}

type Vacuna = {
  id: string
  nombre: string
  descripcion: string | null
  fabricante: string | null
  esquema_dosis: EsquemaDosis[]
}

type PendingTreatment = {
  localId: string
  vacunaId: string
  vacunaNombre: string
  fabricante: string | null
  esquemaId: string
  dosisNumero: number
  dosisNotas: string | null
  intervaloDias: number
  // Cita opcional
  cita?: {
    fechaProgramada: string
    tipo: 'VACUNA' | 'CONTROL' | 'CONSULTA'
    observaciones: string
  }
}

interface CrearTratamientoFormProps {
  fichaId: string
  pacienteNombre: string
  pacienteCi: string
  especialidadNombre: string
  ordenTurno: number | null
  vacunas: Vacuna[]
}

const TIPOS_CITA = [
  { value: 'VACUNA', label: 'Vacuna (próxima dosis)' },
  { value: 'CONTROL', label: 'Control médico' },
  { value: 'CONSULTA', label: 'Consulta general' }
]

export default function CrearTratamientoForm({
  fichaId,
  pacienteNombre,
  pacienteCi,
  especialidadNombre,
  ordenTurno,
  vacunas
}: CrearTratamientoFormProps) {
  const router = useRouter()
  const { createTratamientoBatch } = useTratamientos()

  // ── Selector de vacuna / dosis ──
  const [selectedVacunaId, setSelectedVacunaId] = useState('')
  const [selectedEsquemaId, setSelectedEsquemaId] = useState('')

  // ── Carrito: tratamientos pendientes (aún no enviados) ──
  const [pendingTreatments, setPendingTreatments] = useState<
    PendingTreatment[]
  >([])

  // ── Panel list inline form ──
  const [activeSchedulingId, setActiveSchedulingId] = useState<string | null>(
    null
  )
  const [citaTipo, setCitaTipo] = useState<'VACUNA' | 'CONTROL' | 'CONSULTA'>(
    'VACUNA'
  )
  const [citaObservaciones, setCitaObservaciones] = useState('')
  const [citaFecha, setCitaFecha] = useState<Date | undefined>()

  // ── Modal de detalle de cita desde el calendario ──
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // ── Derivados ──
  const selectedVacuna = vacunas.find(v => v.id === selectedVacunaId)
  const esquemas = selectedVacuna?.esquema_dosis || []
  const selectedEsquema = esquemas.find(e => e.id === selectedEsquemaId)

  // const activeTreatment = pendingTreatments.find(
  //   t => t.localId === activeSchedulingId
  // )

  const eventTreatment = pendingTreatments.find(
    t => t.localId === selectedEventId
  )

  // Eventos del calendario
  const calendarEvents = useMemo(() => {
    return pendingTreatments
      .filter(t => t.cita)
      .map(t => ({
        id: t.localId,
        title: `${t.vacunaNombre} — Dosis ${t.dosisNumero}`,
        start: t.cita!.fechaProgramada,
        allDay: true,
        backgroundColor: '#6366f1',
        borderColor: '#4f46e5',
        extendedProps: {
          tipo: t.cita!.tipo,
          observaciones: t.cita!.observaciones
        }
      }))
  }, [pendingTreatments])

  // ── Handlers ──
  const handleVacunaChange = (vacunaId: string) => {
    setSelectedVacunaId(vacunaId)
    setSelectedEsquemaId('')
  }

  const handleEsquemaChange = (esquemaId: string) => {
    setSelectedEsquemaId(esquemaId)
  }

  const addTreatmentToCart = () => {
    if (!selectedVacunaId || !selectedEsquemaId || !selectedEsquema) {
      toast.error('Selecciona una vacuna y una dosis')
      return
    }

    const alreadyAdded = pendingTreatments.some(
      t => t.esquemaId === selectedEsquemaId
    )
    if (alreadyAdded) {
      toast.error('Esta vacuna/dosis ya fue agregada')
      return
    }

    const newTreatment: PendingTreatment = {
      localId: crypto.randomUUID(),
      vacunaId: selectedVacunaId,
      vacunaNombre: selectedVacuna!.nombre,
      fabricante: selectedVacuna!.fabricante,
      esquemaId: selectedEsquemaId,
      dosisNumero: selectedEsquema.numero,
      dosisNotas: selectedEsquema.notas,
      intervaloDias: selectedEsquema.intervalo_dias
    }

    setPendingTreatments(prev => [...prev, newTreatment])
    toast.success(
      `${selectedVacuna!.nombre} — Dosis ${selectedEsquema.numero} agregada`
    )

    setSelectedVacunaId('')
    setSelectedEsquemaId('')
  }

  const removeTreatment = (localId: string) => {
    setPendingTreatments(prev => prev.filter(t => t.localId !== localId))
    if (activeSchedulingId === localId) {
      setActiveSchedulingId(null)
    }
    if (selectedEventId === localId) {
      setSelectedEventId(null)
    }
  }

  const startScheduling = (localId: string) => {
    if (activeSchedulingId === localId) {
      setActiveSchedulingId(null)
      return
    }
    setActiveSchedulingId(localId)
    const treatment = pendingTreatments.find(t => t.localId === localId)

    if (treatment?.cita) {
      setCitaTipo(treatment.cita.tipo)
      setCitaObservaciones(treatment.cita.observaciones)
      setCitaFecha(new Date(treatment.cita.fechaProgramada))
    } else {
      setCitaTipo('VACUNA')
      setCitaObservaciones('')
      const suggested = getSuggestedDate(treatment?.intervaloDias || 0)
      setCitaFecha(suggested ? new Date(suggested + 'T00:00:00') : undefined)
    }
  }

  const saveCita = () => {
    if (!activeSchedulingId || !citaFecha) {
      toast.error('Debes seleccionar una fecha')
      return
    }

    const appointmentDate = new Date(citaFecha)
    appointmentDate.setHours(8, 0, 0, 0)

    // Validar en el cliente también (por si saltan la validación de DayPicker)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (appointmentDate < today) {
      toast.error('No puedes agendar citas en el pasado')
      return
    }
    const day = appointmentDate.getDay()
    if (day === 0 || day === 6) {
      toast.error('Las citas solo se pueden agendar de Lunes a Viernes')
      return
    }

    setPendingTreatments(prev =>
      prev.map(t =>
        t.localId === activeSchedulingId
          ? {
              ...t,
              cita: {
                fechaProgramada: appointmentDate.toISOString(),
                tipo: citaTipo,
                observaciones: citaObservaciones.trim()
              }
            }
          : t
      )
    )
    toast.success(
      'Cita agendada para el ' +
        formatDate(appointmentDate.toISOString().split('T')[0])
    )
    setActiveSchedulingId(null)
  }

  const removeCita = (localId: string) => {
    setPendingTreatments(prev =>
      prev.map(t => (t.localId === localId ? { ...t, cita: undefined } : t))
    )
    if (selectedEventId === localId) setSelectedEventId(null)
    toast.success('Cita removida')
  }

  // ── SUBMIT BATCH ──
  const handleSubmitBatch = async () => {
    if (pendingTreatments.length === 0) {
      toast.error('Agrega al menos un tratamiento')
      return
    }

    try {
      const payload = {
        fichaOrigenId: fichaId,
        tratamientos: pendingTreatments.map(t => ({
          esquemaId: t.esquemaId,
          dosisNumero: t.dosisNumero,
          vacunaNombre: t.vacunaNombre,
          ...(t.cita && {
            cita: {
              fechaProgramada: t.cita.fechaProgramada,
              tipo: t.cita.tipo,
              ...(t.cita.observaciones && {
                observaciones: t.cita.observaciones
              })
            }
          })
        }))
      }

      const result = await createTratamientoBatch.mutateAsync(payload)

      if (result.success) {
        toast.success(result.message || 'Tratamientos registrados exitosamente')
        if (result.data?.usuario_creado) {
          toast.info(
            `Se creó una cuenta para el paciente. Usuario: ${pacienteCi} | Contraseña: ${pacienteCi}`,
            { duration: 8000 }
          )
        }
        if (result.data?.citas_creadas > 0) {
          toast.success(
            `📅 ${result.data.citas_creadas} cita(s) programada(s)`,
            { duration: 5000 }
          )
        }
        router.push('/dashboard/fichas')
      } else {
        toast.error(result.message || 'Error al registrar tratamientos')
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Error al registrar tratamientos'
      toast.error(message)
    }
  }

  // ── Helpers ──
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-BO', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSuggestedDate = (intervaloDias: number) => {
    if (intervaloDias <= 0) return null
    const d = new Date()
    d.setDate(d.getDate() + intervaloDias)
    return d.toISOString().split('T')[0]
  }

  const hasCitas = pendingTreatments.some(t => t.cita)

  return (
    <section className='crear-tratamiento pb-10'>
      <Title subtitle={`Ficha #${ordenTurno || '—'} · ${especialidadNombre}`}>
        Registrar Tratamiento
      </Title>

      {/* Info paciente */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0'>
            <span className='text-primary-700 font-bold text-step-1'>
              {pacienteNombre.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className='font-semibold text-gray-800 text-step-1'>
              {pacienteNombre}
            </h3>
            <p className='text-gray-500 text-step--1'>CI: {pacienteCi}</p>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6'>
        {/* ── IZQUIERDA ── */}
        <div className='space-y-5'>
          {/* Card: Agregar vacuna */}
          <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5'>
            <div className='flex items-center gap-2 mb-5'>
              <IconVaccine className='text-primary-600' size='24' />
              <h2 className='text-step-1 font-semibold text-gray-800'>
                Agregar vacuna
              </h2>
            </div>

            <div className='flex flex-col gap-1.5 mb-4'>
              <label
                className='font-semibold text-gray-700 text-step--1'
                htmlFor='vacuna'
              >
                Tipo de Vacuna
              </label>
              <div className='relative'>
                <select
                  value={selectedVacunaId}
                  onChange={e => handleVacunaChange(e.target.value)}
                  className='w-full p-2.5 pr-10 border border-gray-300 rounded-lg bg-white outline-none focus:border-primary-500 cursor-pointer text-step--1'
                >
                  <option value=''>Seleccione una vacuna...</option>
                  {vacunas.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.nombre} {v.fabricante ? `— ${v.fabricante}` : ''}
                    </option>
                  ))}
                </select>
                <IconArrowDown
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                  size='16'
                />
              </div>
            </div>

            <div className='flex flex-col gap-1.5 mb-4'>
              <label
                className='font-semibold text-gray-700 text-step--1'
                htmlFor='esquema'
              >
                Dosis a Aplicar
              </label>
              <div className='relative'>
                <select
                  value={selectedEsquemaId}
                  onChange={e => handleEsquemaChange(e.target.value)}
                  disabled={!selectedVacunaId}
                  className='w-full p-2.5 pr-10 border border-gray-300 rounded-lg bg-white outline-none focus:border-primary-500 cursor-pointer text-step--1 disabled:bg-gray-50 disabled:text-gray-400'
                >
                  <option value=''>
                    {selectedVacunaId
                      ? 'Seleccione la dosis...'
                      : 'Primero seleccione vacuna'}
                  </option>
                  {esquemas.map(e => (
                    <option key={e.id} value={e.id}>
                      Dosis {e.numero} {e.notas ? `— ${e.notas}` : ''}
                    </option>
                  ))}
                </select>
                <IconArrowDown
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                  size='16'
                />
              </div>
            </div>

            <button
              type='button'
              onClick={addTreatmentToCart}
              disabled={!selectedEsquemaId}
              className='w-full py-2.5 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition cursor-pointer disabled:opacity-40 text-step--1'
            >
              + Agregar al registro
            </button>
          </div>

          {/* Lista de pendientes */}
          {pendingTreatments.length > 0 && (
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5'>
              <h3 className='font-semibold text-gray-800 text-step-0 mb-3 flex items-center gap-2'>
                <IconVaccine className='text-emerald-600' size='20' />
                Vacunas a registrar ({pendingTreatments.length})
              </h3>

              <ul className='space-y-3 mb-5'>
                {pendingTreatments.map((t, idx) => {
                  const isActive = activeSchedulingId === t.localId
                  const suggestedDate = getSuggestedDate(t.intervaloDias)

                  return (
                    <li
                      key={t.localId}
                      className={`rounded-lg border transition-all ${isActive ? 'border-sky-400 bg-sky-50 shadow-sm' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className='p-3 flex items-start justify-between gap-2'>
                        <div className='flex items-center gap-2 flex-1 min-w-0'>
                          <span className='flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-step--2 shrink-0'>
                            {idx + 1}
                          </span>
                          <div className='min-w-0'>
                            <p className='font-semibold text-gray-800 text-step--1 truncate'>
                              {t.vacunaNombre}
                              {t.fabricante && (
                                <span className='text-gray-400 font-normal'>
                                  {' '}
                                  — {t.fabricante}
                                </span>
                              )}
                            </p>
                            <p className='text-step--2 text-emerald-600 font-medium'>
                              Dosis #{t.dosisNumero}
                            </p>
                          </div>
                        </div>
                        <button
                          type='button'
                          onClick={() => removeTreatment(t.localId)}
                          className='text-red-400 hover:text-red-600 text-step-0 font-bold cursor-pointer'
                        >
                          ✕
                        </button>
                      </div>

                      {/* Scheduling Form Inline */}
                      {isActive && (
                        <div className='px-4 pb-4'>
                          <div className='bg-white p-3 border border-sky-200 rounded-md shadow-sm'>
                            {t.intervaloDias > 0 && (
                              <p className='text-step--2 text-sky-600 mb-2'>
                                💡 Siguiente dosis en aprox.{' '}
                                <strong>{t.intervaloDias} días</strong>
                              </p>
                            )}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-3'>
                              <div className='col-span-1 md:col-span-2 flex flex-col items-center justify-center'>
                                <label
                                  className='block text-[11px] font-semibold text-gray-500 mb-1 w-full'
                                  htmlFor='fecha'
                                >
                                  FECHA (Lunes a Viernes)
                                </label>
                                <div className='bg-white border border-gray-300 rounded p-1 mb-2'>
                                  <DayPicker
                                    mode='single'
                                    selected={citaFecha}
                                    onSelect={setCitaFecha}
                                    disabled={[
                                      { dayOfWeek: [0, 6] },
                                      {
                                        before: new Date(
                                          new Date().setHours(0, 0, 0, 0)
                                        )
                                      }
                                    ]}
                                    styles={{
                                      root: {
                                        '--rdp-accent-color': '#12977e'
                                      } as React.CSSProperties
                                    }}
                                    className='text-step-1 w-full'
                                    modifiersClassNames={{
                                      selected:
                                        'bg-primary-500 text-white rounded-full',
                                      today:
                                        'border-2 border-secondary-500 rounded-full'
                                    }}
                                    animate
                                    locale={es}
                                    captionLayout='dropdown'
                                  />
                                </div>
                              </div>
                              <div>
                                <label
                                  className='block text-[11px] font-semibold text-gray-500 mb-1'
                                  htmlFor='citaTipo'
                                >
                                  TIPO
                                </label>
                                <select
                                  value={citaTipo}
                                  onChange={e =>
                                    setCitaTipo(e.target.value as any)
                                  }
                                  className='w-full border border-gray-300 rounded p-1.5 text-step--2'
                                >
                                  {TIPOS_CITA.map(tipo => (
                                    <option key={tipo.value} value={tipo.value}>
                                      {tipo.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className='mb-3'>
                              <label
                                className='block text-[11px] font-semibold text-gray-500 mb-1'
                                htmlFor='citaObservaciones'
                              >
                                OBSERVACIONES
                              </label>
                              <input
                                type='text'
                                value={citaObservaciones}
                                onChange={e =>
                                  setCitaObservaciones(e.target.value)
                                }
                                placeholder='Opcional...'
                                maxLength={500}
                                className='w-full border border-gray-300 rounded p-1.5 text-step--2'
                              />
                            </div>
                            <div className='flex gap-2 justify-end'>
                              <button
                                onClick={() => setActiveSchedulingId(null)}
                                className='px-3 py-1 text-step--2 text-gray-500 font-medium'
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={saveCita}
                                className='px-3 py-1 bg-sky-600 text-white rounded font-medium text-step--2'
                              >
                                Guardar cita
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {!isActive && (
                        <div className='p-3 pt-0 ml-8'>
                          {t.cita ? (
                            <div className='flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5'>
                              <IconCalendar
                                size='14'
                                className='text-blue-500 shrink-0'
                              />
                              <span className='text-step--2 text-blue-700 flex-1'>
                                {formatDate(
                                  t.cita.fechaProgramada.split('T')[0]
                                )}{' '}
                                · {t.cita.tipo}
                              </span>
                              <button
                                type='button'
                                onClick={() => startScheduling(t.localId)}
                                className='text-blue-500 hover:text-blue-700 text-step--2 font-semibold mx-1 cursor-pointer'
                              >
                                Editar
                              </button>
                              <button
                                type='button'
                                onClick={() => removeCita(t.localId)}
                                className='text-red-400 hover:text-red-600 text-step--2 font-bold cursor-pointer'
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              type='button'
                              onClick={() => startScheduling(t.localId)}
                              className='text-step--2 font-medium flex items-center gap-1 text-blue-500 hover:text-blue-700 cursor-pointer'
                            >
                              <IconCalendar size='14' /> Registrar cita futura
                              {suggestedDate && (
                                <span className='text-gray-400 ml-1'>
                                  (sugerido: {t.intervaloDias}d)
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>

              <div className='pt-4 border-t border-gray-200 space-y-3'>
                {hasCitas && (
                  <div className='bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-step--2 text-blue-700'>
                    📅 {pendingTreatments.filter(t => t.cita).length} cita(s)
                    programada(s)
                  </div>
                )}
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => router.push('/dashboard/fichas')}
                    className='flex-1 py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 text-step--1'
                  >
                    Cancelar
                  </button>
                  <button
                    type='button'
                    onClick={handleSubmitBatch}
                    disabled={createTratamientoBatch.isPending}
                    className='flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 text-step--1 flex items-center justify-center gap-2'
                  >
                    {createTratamientoBatch.isPending ? (
                      'Registrando...'
                    ) : (
                      <>
                        <IconCheck size='18' /> Registrar todo
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── DERECHA: Calendario View ── */}
        <div className='hidden lg:block'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5 sticky top-4'>
            <div className='flex items-center gap-2 mb-4'>
              <IconCalendar className='text-sky-600' size='22' />
              <h2 className='font-semibold text-gray-800 text-step-0'>
                Vista de Citas Agendadas
              </h2>
            </div>
            <div className='tratamiento-calendar'>
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView='dayGridMonth'
                headerToolbar={{
                  left: 'prev,next',
                  center: 'title',
                  right: 'today'
                }}
                height='auto'
                locale={esLocale}
                weekends={false}
                events={calendarEvents}
                eventClick={info => {
                  setSelectedEventId(info.event.id)
                }}
              />
            </div>
            <p className='text-step--2 text-gray-400 mt-4 text-center'>
              Haz clic sobre una cita agendada para ver los detalles.
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal Detalle Cita ── */}
      <Modal
        isOpen={!!selectedEventId}
        onClose={() => setSelectedEventId(null)}
        title='Detalle de Cita Programada'
      >
        {eventTreatment && eventTreatment.cita && (
          <div className='space-y-4 text-step--1'>
            <div className='bg-blue-50 border border-blue-200 rounded p-4'>
              <h4 className='font-bold text-blue-800 text-step-0 mb-1'>
                {eventTreatment.vacunaNombre}
              </h4>
              <p className='text-blue-600 font-medium'>
                Dosis #{eventTreatment.dosisNumero}
              </p>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div>
                <p className='text-gray-500 font-semibold mb-1'>Fecha</p>
                <p className='text-gray-800 font-medium'>
                  {formatDate(
                    eventTreatment.cita.fechaProgramada.split('T')[0]
                  )}
                </p>
              </div>
              <div>
                <p className='text-gray-500 font-semibold mb-1'>Tipo de Cita</p>
                <p className='text-gray-800 font-medium'>
                  {eventTreatment.cita.tipo}
                </p>
              </div>
            </div>
            {eventTreatment.cita.observaciones && (
              <div>
                <p className='text-gray-500 font-semibold mb-1'>
                  Observaciones
                </p>
                <p className='text-gray-800 bg-gray-50 p-2 rounded border border-gray-100'>
                  {eventTreatment.cita.observaciones}
                </p>
              </div>
            )}
            <div className='mt-6 border-t pt-4 flex gap-3'>
              <button
                className='flex-1 border border-gray-300 py-2 rounded text-gray-700 font-semibold hover:bg-gray-50'
                onClick={() => setSelectedEventId(null)}
              >
                Cerrar
              </button>
              <button
                className='flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded font-semibold hover:bg-red-100'
                onClick={() => removeCita(eventTreatment.localId)}
              >
                Eliminar Cita
              </button>
            </div>
          </div>
        )}
      </Modal>

      <style>{`
        .tratamiento-calendar .fc { font-size: 0.8rem; }
        .tratamiento-calendar .fc-event { cursor: pointer; padding: 2px 4px; }
        .tratamiento-calendar .fc-toolbar-title { font-size: 1rem !important; }
        .tratamiento-calendar .fc-button { padding: 4px 8px !important; }
      `}</style>
    </section>
  )
}
