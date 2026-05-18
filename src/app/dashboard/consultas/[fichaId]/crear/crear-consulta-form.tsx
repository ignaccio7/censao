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
}

export default function CrearConsultaForm({
  fichaId,
  pacienteNombre,
  pacienteCi,
  especialidadNombre,
  ordenTurno
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
        router.push('/dashboard/fichas')
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
                <div className='bg-blue-50 border border-blue-100 rounded-md px-3 py-2 text-step--2 text-blue-700'>
                  📅 Cita de retorno programada para el{' '}
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
                  onClick={() => router.push('/dashboard/fichas')}
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
                <div className='bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2 text-step--2 text-emerald-700'>
                  ✅ Cita programada para el{' '}
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
