// oxlint-disable no-magic-numbers
'use client'
// TODO ver como refactorizar esto ya que debe usar reacthookform y obtener las validaciones del esquema y tenemos un componente input reutilizable
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Title from '@/app/components/ui/title'
import {
  IconCheckupList,
  IconCalendar,
  IconCheck
} from '@/app/components/icons/icons'
import { useConsultas } from '@/app/services/consultas'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { es } from 'react-day-picker/locale'

const TIPOS_CITA = [
  { value: 'CONTROL', label: 'Control médico' },
  { value: 'CONSULTA', label: 'Consulta general' }
]

interface CrearConsultaFormProps {
  fichaId: string
  pacienteNombre: string
  pacienteCi: string
  especialidadNombre: string
  ordenTurno: number | null
  consultaPadreId?: string
  motivoPadre?: string
  // Datos del doctor/especialidad para el selector de cita de retorno
  doctorDefaultId?: string
  doctorDefaultNombre?: string
  turnoDefaultCodigo?: 'AM' | 'PM' | string
  doctoresDisponibles?: {
    id: string
    nombre: string
    turnos: ('AM' | 'PM')[]
  }[]
}

export default function CrearConsultaForm({
  fichaId,
  pacienteNombre,
  pacienteCi,
  especialidadNombre,
  ordenTurno,
  consultaPadreId,
  motivoPadre,
  doctorDefaultId,
  doctorDefaultNombre,
  turnoDefaultCodigo,
  doctoresDisponibles
}: CrearConsultaFormProps) {
  const router = useRouter()
  const { createConsulta } = useConsultas()

  // ── Campos del formulario ──
  const [motivoConsulta, setMotivoConsulta] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [requiereRetorno, setRequiereRetorno] = useState(false)

  // ── Cita de retorno (solo si requiereRetorno) ──
  const [showCitaForm, setShowCitaForm] = useState(false)
  const [citaTipo, setCitaTipo] = useState<'CONTROL' | 'CONSULTA'>('CONTROL')
  const [citaObservaciones, setCitaObservaciones] = useState('')
  const [citaFecha, setCitaFecha] = useState<Date | undefined>()

  // ── Selector de doctor para la cita de retorno ──
  const [doctorOverride, setDoctorOverride] = useState<string | undefined>()
  const [turnoOverride, setTurnoOverride] = useState<'AM' | 'PM' | undefined>()
  const [doctorSelectorActivo, setDoctorSelectorActivo] = useState(false)

  // Al cambiar de doctor, auto-seleccionar el primer turno disponible de ese doctor
  const handleDoctorChange = (newDoctorId: string) => {
    setDoctorOverride(newDoctorId)
    const doctor = doctoresDisponibles?.find(d => d.id === newDoctorId)
    setTurnoOverride(doctor?.turnos[0] as 'AM' | 'PM' | undefined)
  }

  // ── Handlers ──
  const handleRequiereRetornoChange = (value: boolean) => {
    setRequiereRetorno(value)
    if (value) {
      setShowCitaForm(true)
    } else {
      setShowCitaForm(false)
      setCitaFecha(undefined)
      setCitaObservaciones('')
    }
  }

  const handleSubmit = async () => {
    if (!motivoConsulta.trim()) {
      toast.error('El motivo de consulta es obligatorio')
      return
    }

    if (motivoConsulta.trim().length < 3) {
      toast.error('El motivo debe tener al menos 3 caracteres')
      return
    }

    // Validar cita si requiere retorno y tiene fecha
    if (requiereRetorno && showCitaForm && citaFecha) {
      const appointmentDate = new Date(citaFecha)
      appointmentDate.setHours(8, 0, 0, 0)

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
    }

    try {
      const payload: any = {
        fichaOrigenId: fichaId,
        motivoConsulta: motivoConsulta.trim(),
        requiereRetorno
      }

      if (consultaPadreId) {
        payload.consultaPadreId = consultaPadreId
      }

      if (observaciones.trim()) {
        payload.observaciones = observaciones.trim()
      }

      // Agregar cita de retorno si fue configurada
      if (requiereRetorno && showCitaForm && citaFecha) {
        const appointmentDate = new Date(citaFecha)
        appointmentDate.setHours(8, 0, 0, 0)

        payload.cita = {
          fechaProgramada: appointmentDate.toISOString(),
          tipo: citaTipo,
          // Solo enviar doctorId/turnoCodigo si el usuario cambió activamente el doctor
          ...(doctorOverride && { doctorId: doctorOverride }),
          ...(turnoOverride && { turnoCodigo: turnoOverride }),
          ...(citaObservaciones.trim() && {
            observaciones: citaObservaciones.trim()
          })
        }
      }

      const result = await createConsulta.mutateAsync(payload)

      if (result.success) {
        toast.success(result.message || 'Consulta registrada exitosamente')
        if (result.data?.cita_creada) {
          toast.success('📅 Cita de retorno programada', { duration: 5000 })
        }
        router.push(`/dashboard/consultas/${fichaId}`)
      } else {
        toast.error(result.message || 'Error al registrar consulta')
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Error al registrar consulta'
      toast.error(message)
    }
  }

  return (
    <section className='crear-consulta pb-10'>
      <Title subtitle={`Ficha #${ordenTurno || '—'} · ${especialidadNombre}`}>
        Registrar Consulta Médica
      </Title>

      {/* Info paciente e indicador de seguimiento */}
      <div className='flex flex-col gap-4 mb-6'>
        {consultaPadreId && motivoPadre && (
          <div className='bg-primary-50 border border-primary-200 rounded-lg p-4 flex items-center gap-3'>
            <div className='bg-primary-100 p-2 rounded-full'>
              <IconCheckupList className='text-primary-700' size='20' />
            </div>
            <div>
              <p className='text-xs font-bold text-primary-700 uppercase tracking-wide'>
                Registrando seguimiento de consulta
              </p>
              <p className='text-primary-900 font-medium text-sm'>
                {motivoPadre}
              </p>
            </div>
          </div>
        )}

        <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-4'>
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
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6'>
        {/* ── IZQUIERDA: Formulario ── */}
        <div className='space-y-5'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5'>
            <div className='flex items-center gap-2 mb-5'>
              <IconCheckupList className='text-primary-600' size='24' />
              <h2 className='text-step-1 font-semibold text-gray-800'>
                Datos de la consulta
              </h2>
            </div>

            {/* Motivo de consulta */}
            <div className='flex flex-col gap-1.5 mb-4'>
              <label
                className='font-semibold text-gray-700 text-step--1'
                htmlFor='motivoConsulta'
              >
                Motivo de Consulta *
              </label>
              <input
                id='motivoConsulta'
                type='text'
                value={motivoConsulta}
                onChange={e => setMotivoConsulta(e.target.value)}
                placeholder='Ej: Papanicolao, Control de tensión, Dolor abdominal...'
                maxLength={500}
                className='w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:border-primary-500 text-step--1'
              />
            </div>

            {/* Observaciones */}
            <div className='flex flex-col gap-1.5 mb-4'>
              <label
                className='font-semibold text-gray-700 text-step--1'
                htmlFor='observaciones'
              >
                Observaciones (opcional)
              </label>
              <textarea
                id='observaciones'
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
                placeholder='Notas clínicas sobre la atención...'
                maxLength={1000}
                rows={3}
                className='w-full p-2.5 border border-gray-300 rounded-lg bg-white outline-none focus:border-primary-500 text-step--1 resize-none'
              />
            </div>

            {/* Requiere retorno */}
            <div className='flex flex-col gap-1.5 mb-4'>
              <label
                className='font-semibold text-gray-700 text-step--1'
                htmlFor='requiereRetorno'
              >
                ¿El paciente requiere retorno?
              </label>
              <div className='flex gap-4'>
                <button
                  type='button'
                  onClick={() => handleRequiereRetornoChange(true)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition text-step--1 cursor-pointer ${
                    requiereRetorno
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Sí, debe volver
                </button>
                <button
                  type='button'
                  onClick={() => handleRequiereRetornoChange(false)}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold transition text-step--1 cursor-pointer ${
                    !requiereRetorno
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  No requiere
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className='pt-4 border-t border-gray-200 space-y-3'>
              {requiereRetorno && showCitaForm && citaFecha && (
                <div className='bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-step--2 text-blue-700 flex flex-row gap-1 items-center'>
                  <IconCalendar /> Cita de retorno programada para el{' '}
                  {citaFecha.toLocaleDateString('es-BO', {
                    weekday: 'short',
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}{' '}
                  · {citaTipo}
                </div>
              )}
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={() => router.push(`/dashboard/consultas/${fichaId}`)}
                  className='flex-1 py-2.5 px-4 border border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 text-step--1 cursor-pointer'
                >
                  Cancelar
                </button>
                <button
                  type='button'
                  onClick={handleSubmit}
                  disabled={createConsulta.isPending}
                  className='flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 text-step--1 flex items-center justify-center gap-2 cursor-pointer'
                >
                  {createConsulta.isPending ? (
                    'Registrando...'
                  ) : (
                    <>
                      <IconCheck size='18' /> Registrar consulta
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── DERECHA: Cita de retorno ── */}
        <div>
          {requiereRetorno && showCitaForm ? (
            <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5 sticky top-4'>
              <div className='flex items-center gap-2 mb-4'>
                <IconCalendar className='text-sky-600' size='22' />
                <h2 className='font-semibold text-gray-800 text-step-0'>
                  Programar Cita de Retorno
                </h2>
              </div>

              {/* ── Selector de Doctor ── */}
              <div className='flex flex-col gap-1.5 mb-4'>
                <div className='flex items-center justify-between'>
                  <label
                    className='block text-[11px] font-semibold text-gray-500 uppercase tracking-wide'
                    htmlFor='doctor'
                  >
                    Doctor Asignado
                  </label>
                  {(doctoresDisponibles?.length ?? 0) > 1 && (
                    <button
                      type='button'
                      onClick={() => {
                        const next = !doctorSelectorActivo
                        setDoctorSelectorActivo(next)
                        if (!next) {
                          setDoctorOverride(undefined)
                          setTurnoOverride(undefined)
                        }
                      }}
                      className='text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer'
                    >
                      {doctorSelectorActivo
                        ? '↩ Usar doctor original'
                        : '✎ Cambiar doctor'}
                    </button>
                  )}
                </div>

                {doctorSelectorActivo && doctoresDisponibles ? (
                  <div className='flex flex-col gap-2'>
                    {/* Selector de doctor */}
                    <select
                      value={doctorOverride ?? doctorDefaultId ?? ''}
                      onChange={e => handleDoctorChange(e.target.value)}
                      className='w-full border border-blue-300 rounded p-1.5 text-step--2 bg-blue-50 outline-none focus:border-blue-500 cursor-pointer'
                    >
                      {doctoresDisponibles.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.nombre}
                        </option>
                      ))}
                    </select>

                    {/* Selector de turno del doctor seleccionado */}
                    {(() => {
                      const doctorActual = doctoresDisponibles.find(
                        d => d.id === (doctorOverride ?? doctorDefaultId)
                      )
                      if (!doctorActual || doctorActual.turnos.length === 0)
                        return null
                      if (doctorActual.turnos.length === 1) {
                        return (
                          <p className='text-[10px] text-gray-500 bg-gray-50 border border-gray-200 rounded px-2 py-1'>
                            Turno:{' '}
                            <strong>
                              {doctorActual.turnos[0] === 'AM'
                                ? 'Mañana (AM)'
                                : 'Tarde (PM)'}
                            </strong>
                          </p>
                        )
                      }
                      return (
                        <div className='flex flex-col gap-1'>
                          <label
                            className='block text-[10px] font-semibold text-gray-500 uppercase tracking-wide'
                            htmlFor='turno'
                          >
                            Turno
                          </label>
                          <select
                            value={turnoOverride ?? doctorActual.turnos[0]}
                            onChange={e =>
                              setTurnoOverride(e.target.value as 'AM' | 'PM')
                            }
                            className='w-full border border-blue-200 rounded p-1.5 text-step--2 bg-blue-50 outline-none focus:border-blue-500 cursor-pointer'
                          >
                            {doctorActual.turnos.map(t => (
                              <option key={t} value={t}>
                                {t === 'AM' ? 'Mañana (AM)' : 'Tarde (PM)'}
                              </option>
                            ))}
                          </select>
                        </div>
                      )
                    })()}
                  </div>
                ) : (
                  <div className='text-step--2 text-gray-700 bg-gray-50 border border-gray-200 rounded p-2 flex flex-col gap-1'>
                    <div className='flex items-center gap-1.5'>
                      <span>👨‍⚕️</span>
                      <span className='font-medium'>
                        {doctorDefaultNombre ?? 'Doctor asignado a la ficha'}
                      </span>
                    </div>
                    {turnoDefaultCodigo && (
                      <div className='text-[11px] text-gray-500 pl-6'>
                        Turno asignado:{' '}
                        <strong>
                          {turnoDefaultCodigo === 'AM'
                            ? 'Mañana (AM)'
                            : 'Tarde (PM)'}
                        </strong>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tipo de cita */}
              <div className='flex flex-col gap-1.5 mb-4'>
                <label
                  className='block text-[11px] font-semibold text-gray-500 mb-1'
                  htmlFor='citaTipoConsulta'
                >
                  TIPO DE CITA
                </label>
                <select
                  id='citaTipoConsulta'
                  value={citaTipo}
                  onChange={e =>
                    setCitaTipo(e.target.value as 'CONTROL' | 'CONSULTA')
                  }
                  className='w-full border border-gray-300 rounded p-1.5 text-step--2 cursor-pointer'
                >
                  {TIPOS_CITA.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div className='flex flex-col gap-1.5 mb-4'>
                <label
                  className='block text-[11px] font-semibold text-gray-500 mb-1'
                  htmlFor='citaFechaConsulta'
                >
                  FECHA (Lunes a Viernes)
                </label>
                <div className='bg-white border border-gray-300 rounded p-1'>
                  <DayPicker
                    mode='single'
                    selected={citaFecha}
                    onSelect={setCitaFecha}
                    fromYear={new Date().getFullYear()}
                    toYear={new Date().getFullYear() + 5}
                    disabled={[
                      { dayOfWeek: [0, 6] },
                      {
                        before: new Date(new Date().setHours(0, 0, 0, 0))
                      }
                    ]}
                    styles={{
                      root: {
                        '--rdp-accent-color': '#12977e'
                      } as React.CSSProperties
                    }}
                    className='text-step-1 w-full'
                    modifiersClassNames={{
                      selected: 'bg-primary-500 text-white rounded-full',
                      today: 'border-2 border-secondary-500 rounded-full'
                    }}
                    animate
                    locale={es}
                    captionLayout='dropdown'
                  />
                </div>
              </div>

              {/* Observaciones de la cita */}
              <div className='flex flex-col gap-1.5 mb-4'>
                <label
                  className='block text-[11px] font-semibold text-gray-500 mb-1'
                  htmlFor='citaObsConsulta'
                >
                  OBSERVACIONES DE LA CITA (opcional)
                </label>
                <input
                  id='citaObsConsulta'
                  type='text'
                  value={citaObservaciones}
                  onChange={e => setCitaObservaciones(e.target.value)}
                  placeholder='Notas para la cita de retorno...'
                  maxLength={500}
                  className='w-full border border-gray-300 rounded p-1.5 text-step--2'
                />
              </div>

              {citaFecha && (
                <div className='bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-step--2 text-emerald-700 flex flex-row gap-1 items-center'>
                  <IconCheck /> Cita programada para el{' '}
                  <strong>
                    {citaFecha.toLocaleDateString('es-BO', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </strong>
                </div>
              )}
            </div>
          ) : (
            <div className='bg-gray-50 rounded-lg border border-gray-200 p-8 text-center sticky top-4'>
              <IconCalendar className='text-gray-300 mx-auto mb-3' size='48' />
              <p className='text-gray-400 text-step--1'>
                {requiereRetorno
                  ? 'Configure la cita de retorno'
                  : 'Active "Sí, debe volver" para programar una cita de retorno'}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
