'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import Title from '@/app/components/ui/title'
import {
  IconVaccine,
  IconArrowDown,
  IconCheckupList,
  IconCalendar
} from '@/app/components/icons/icons'
import { useTratamientos } from '@/app/services/tratamientos'

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

type TratamientoRegistrado = {
  vacunaNombre: string
  dosisNumero: number
  fabricante: string | null
  citaProgramada: string | null
  citaTipo: string | null
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
  const { createTratamiento } = useTratamientos()

  // ── Vacuna / Dosis ──
  const [selectedVacunaId, setSelectedVacunaId] = useState('')
  const [selectedEsquemaId, setSelectedEsquemaId] = useState('')

  // ── Cita futura (opcional) ──
  const [agendarCita, setAgendarCita] = useState(false)
  const [citaFecha, setCitaFecha] = useState('')
  const [citaTipo, setCitaTipo] = useState('VACUNA')
  const [citaObservaciones, setCitaObservaciones] = useState('')

  // ── Tratamientos registrados ──
  const [tratamientosRegistrados, setTratamientosRegistrados] = useState<
    TratamientoRegistrado[]
  >([])

  // Obtener esquemas de la vacuna seleccionada
  const selectedVacuna = vacunas.find(v => v.id === selectedVacunaId)
  const esquemas = selectedVacuna?.esquema_dosis || []

  // Obtener la dosis seleccionada
  const selectedEsquema = esquemas.find(e => e.id === selectedEsquemaId)

  // Fecha mínima para la cita (mañana)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  // Si el esquema tiene intervalo_dias, sugerir la fecha por defecto
  const getSuggestedDate = () => {
    if (selectedEsquema && selectedEsquema.intervalo_dias > 0) {
      const suggested = new Date()
      suggested.setDate(suggested.getDate() + selectedEsquema.intervalo_dias)
      return suggested.toISOString().split('T')[0]
    }
    return ''
  }

  const handleVacunaChange = (vacunaId: string) => {
    setSelectedVacunaId(vacunaId)
    setSelectedEsquemaId('')
    // Reset cita fields
    setAgendarCita(false)
    setCitaFecha('')
    setCitaObservaciones('')
  }

  const handleEsquemaChange = (esquemaId: string) => {
    setSelectedEsquemaId(esquemaId)
    // Si se activa agendar cita, precargar la fecha sugerida
    if (agendarCita) {
      const esquema = esquemas.find(e => e.id === esquemaId)
      if (esquema && esquema.intervalo_dias > 0) {
        const suggested = new Date()
        suggested.setDate(suggested.getDate() + esquema.intervalo_dias)
        setCitaFecha(suggested.toISOString().split('T')[0])
      }
    }
  }

  const handleAgendarCitaToggle = (checked: boolean) => {
    setAgendarCita(checked)
    if (checked) {
      // Precargar la fecha sugerida basada en el intervalo
      const suggested = getSuggestedDate()
      if (suggested) setCitaFecha(suggested)
    } else {
      setCitaFecha('')
      setCitaObservaciones('')
      setCitaTipo('VACUNA')
    }
  }

  const resetForm = () => {
    setSelectedVacunaId('')
    setSelectedEsquemaId('')
    setAgendarCita(false)
    setCitaFecha('')
    setCitaTipo('VACUNA')
    setCitaObservaciones('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedEsquemaId || !selectedEsquema) {
      toast.error('Selecciona una vacuna y una dosis')
      return
    }

    if (agendarCita && !citaFecha) {
      toast.error('Selecciona una fecha para la cita')
      return
    }

    try {
      // Construir payload con cita opcional
      const payload: any = {
        fichaOrigenId: fichaId,
        esquemaId: selectedEsquemaId,
        dosisNumero: selectedEsquema.numero
      }

      if (agendarCita && citaFecha) {
        // Convertir fecha local a ISO datetime (a las 08:00 AM hora local)
        payload.cita = {
          fechaProgramada: new Date(`${citaFecha}T08:00:00`).toISOString(),
          tipo: citaTipo,
          ...(citaObservaciones.trim() && {
            observaciones: citaObservaciones.trim()
          })
        }
      }

      const result = await createTratamiento.mutateAsync(payload)

      if (result.success) {
        toast.success(result.message)

        // Si se creó un usuario nuevo, mostrar notificación extra
        if (result.data?.usuario_creado) {
          toast.info(
            `Se creó una cuenta para el paciente. Usuario: ${pacienteCi} | Contraseña: ${pacienteCi}`,
            { duration: 8000 }
          )
        }

        if (result.data?.cita_creada) {
          toast.success('📅 Cita futura programada correctamente', {
            duration: 5000
          })
        }

        // Agregar a la lista de tratamientos registrados
        setTratamientosRegistrados(prev => [
          ...prev,
          {
            vacunaNombre: selectedVacuna!.nombre,
            dosisNumero: selectedEsquema.numero,
            fabricante: selectedVacuna!.fabricante,
            citaProgramada: agendarCita ? citaFecha : null,
            citaTipo: agendarCita ? citaTipo : null
          }
        ])

        // Resetear el formulario para permitir otro registro
        resetForm()
      } else {
        toast.error(result.message || 'Error al registrar el tratamiento')
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Error al registrar el tratamiento'
      toast.error(message)
    }
  }

  const formatCitaDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00')
    return date.toLocaleDateString('es-BO', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <section className='crear-tratamiento'>
      <Title subtitle={`Ficha #${ordenTurno || '—'} · ${especialidadNombre}`}>
        Registrar Tratamiento
      </Title>

      {/* Info del paciente */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-100 p-5 mb-6 max-w-2xl'>
        <div className='flex items-center gap-3 mb-1'>
          <div className='w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center'>
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

      {/* Tratamientos ya registrados en esta sesión */}
      {tratamientosRegistrados.length > 0 && (
        <div className='bg-emerald-50 border border-emerald-200 rounded-lg p-5 mb-6 max-w-2xl'>
          <div className='flex items-center gap-2 mb-3'>
            <IconCheckupList className='text-emerald-600' size='24' />
            <h3 className='font-semibold text-emerald-800 text-step-0'>
              Tratamientos registrados ({tratamientosRegistrados.length})
            </h3>
          </div>
          <ul className='space-y-2'>
            {tratamientosRegistrados.map((t, index) => (
              <li
                key={index}
                className='bg-white rounded-md px-4 py-2.5 border border-emerald-100'
              >
                <div className='flex items-center gap-3'>
                  <span className='flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-step--1'>
                    {index + 1}
                  </span>
                  <div className='flex-1'>
                    <span className='font-semibold text-gray-800'>
                      {t.vacunaNombre}
                    </span>
                    {t.fabricante && (
                      <span className='text-gray-500 text-step--1'>
                        {' '}
                        — {t.fabricante}
                      </span>
                    )}
                    <span className='ml-2 text-emerald-600 font-medium text-step--1'>
                      Dosis #{t.dosisNumero}
                    </span>
                  </div>
                  <span className='text-emerald-600 text-step--1 font-medium'>
                    ✓ Registrado
                  </span>
                </div>
                {t.citaProgramada && (
                  <div className='ml-10 mt-1.5 flex items-center gap-1.5 text-step--1 text-blue-600'>
                    <IconCalendar size='14' className='text-blue-500' />
                    <span>
                      Cita programada: {formatCitaDate(t.citaProgramada)} (
                      {t.citaTipo})
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Botón para finalizar */}
          <div className='mt-4 pt-3 border-t border-emerald-200'>
            <p className='text-emerald-700 text-step--1 mb-3'>
              Puedes registrar otro tratamiento abajo o finalizar.
            </p>
            <button
              type='button'
              onClick={() => router.push('/dashboard/fichas')}
              className='w-full py-2.5 px-4 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-200 cursor-pointer'
            >
              Finalizar y volver a fichas
            </button>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form
        onSubmit={handleSubmit}
        className='bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-2xl'
      >
        {/* ── Sección 1: Vacuna y Dosis ── */}
        <div className='flex items-center gap-2 mb-6'>
          <IconVaccine className='text-primary-600' size='28' />
          <h2 className='text-step-1 font-semibold text-gray-800'>
            {tratamientosRegistrados.length > 0
              ? 'Agregar otro tratamiento'
              : 'Seleccionar Vacuna y Dosis'}
          </h2>
        </div>

        {/* Select de Vacuna */}
        <div className='flex flex-col gap-2 mb-5'>
          <label
            htmlFor='vacuna'
            className='font-semibold text-gray-700 text-step-0'
          >
            Tipo de Vacuna
          </label>
          <div className='relative'>
            <select
              id='vacuna'
              value={selectedVacunaId}
              onChange={e => handleVacunaChange(e.target.value)}
              className='w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer transition-all duration-200 text-step-0'
              required
            >
              <option value=''>Seleccione una vacuna...</option>
              {vacunas.map(vacuna => (
                <option key={vacuna.id} value={vacuna.id}>
                  {vacuna.nombre}
                  {vacuna.fabricante ? ` — ${vacuna.fabricante}` : ''}
                </option>
              ))}
            </select>
            <IconArrowDown
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              size='20'
            />
          </div>
          {selectedVacuna?.descripcion && (
            <p className='text-step--1 text-gray-500 ml-1'>
              {selectedVacuna.descripcion}
            </p>
          )}
        </div>

        {/* Select de Dosis (esquema) */}
        <div className='flex flex-col gap-2 mb-6'>
          <label
            htmlFor='dosis'
            className='font-semibold text-gray-700 text-step-0'
          >
            Dosis a Aplicar
          </label>
          <div className='relative'>
            <select
              id='dosis'
              value={selectedEsquemaId}
              onChange={e => handleEsquemaChange(e.target.value)}
              className='w-full p-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white appearance-none cursor-pointer transition-all duration-200 text-step-0 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed'
              disabled={!selectedVacunaId}
              required
            >
              <option value=''>
                {selectedVacunaId
                  ? 'Seleccione la dosis...'
                  : 'Primero seleccione una vacuna'}
              </option>
              {esquemas.map(esquema => (
                <option key={esquema.id} value={esquema.id}>
                  Dosis {esquema.numero}
                  {esquema.notas ? ` — ${esquema.notas}` : ''}
                </option>
              ))}
            </select>
            <IconArrowDown
              className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
              size='20'
            />
          </div>
        </div>

        {/* Info del esquema seleccionado */}
        {selectedEsquema && (
          <div className='bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6'>
            <h4 className='font-semibold text-primary-800 text-step-0 mb-2'>
              Detalle de la dosis seleccionada
            </h4>
            <ul className='text-step--1 text-primary-700 space-y-1'>
              <li>
                <span className='font-medium'>Dosis:</span> #
                {selectedEsquema.numero}
              </li>
              {selectedEsquema.intervalo_dias > 0 && (
                <li>
                  <span className='font-medium'>Intervalo mínimo:</span>{' '}
                  {selectedEsquema.intervalo_dias} días desde la dosis anterior
                </li>
              )}
              {selectedEsquema.edad_min_meses && (
                <li>
                  <span className='font-medium'>Edad mínima:</span>{' '}
                  {selectedEsquema.edad_min_meses} meses
                </li>
              )}
              {selectedEsquema.notas && (
                <li>
                  <span className='font-medium'>Nota:</span>{' '}
                  {selectedEsquema.notas}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* ── Sección 2: Cita Futura (Opcional) ── */}
        {selectedEsquemaId && (
          <div className='border-t border-gray-200 pt-6 mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='flex items-center gap-2'>
                <IconCalendar className='text-blue-600' size='24' />
                <h3 className='text-step-0 font-semibold text-gray-800'>
                  Programar cita futura
                </h3>
                <span className='text-step--2 text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full'>
                  Opcional
                </span>
              </div>
              <label
                aria-label='Agendar cita futura'
                className='relative inline-flex items-center cursor-pointer'
              >
                <input
                  type='checkbox'
                  checked={agendarCita}
                  onChange={e => handleAgendarCitaToggle(e.target.checked)}
                  className='sr-only peer'
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
              </label>
            </div>

            {agendarCita && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4'>
                {/* Sugerencia automática de intervalo */}
                {selectedEsquema && selectedEsquema.intervalo_dias > 0 && (
                  <div className='bg-blue-100 border border-blue-300 rounded-md px-3 py-2 text-step--1 text-blue-800'>
                    💡 Según el esquema, la próxima dosis debería aplicarse en{' '}
                    <strong>{selectedEsquema.intervalo_dias} días</strong>{' '}
                    (fecha sugerida pre-cargada).
                  </div>
                )}

                {/* Tipo de cita */}
                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='tipoCita'
                    className='font-semibold text-gray-700 text-step--1'
                  >
                    Tipo de cita
                  </label>
                  <div className='relative'>
                    <select
                      id='tipoCita'
                      value={citaTipo}
                      onChange={e => setCitaTipo(e.target.value)}
                      className='w-full p-2.5 pr-10 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white appearance-none cursor-pointer transition-all duration-200 text-step--1'
                    >
                      {TIPOS_CITA.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </option>
                      ))}
                    </select>
                    <IconArrowDown
                      className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none'
                      size='16'
                    />
                  </div>
                </div>

                {/* Fecha programada */}
                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='fechaCita'
                    className='font-semibold text-gray-700 text-step--1'
                  >
                    Fecha programada
                  </label>
                  <input
                    type='date'
                    id='fechaCita'
                    value={citaFecha}
                    onChange={e => setCitaFecha(e.target.value)}
                    min={minDate}
                    className='w-full p-2.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white transition-all duration-200 text-step--1 cursor-pointer'
                    required={agendarCita}
                  />
                  {citaFecha && (
                    <p className='text-step--2 text-blue-600 ml-1'>
                      📅 {formatCitaDate(citaFecha)}
                    </p>
                  )}
                </div>

                {/* Observaciones */}
                <div className='flex flex-col gap-1.5'>
                  <label
                    htmlFor='observacionesCita'
                    className='font-semibold text-gray-700 text-step--1'
                  >
                    Observaciones{' '}
                    <span className='font-normal text-gray-400'>
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id='observacionesCita'
                    value={citaObservaciones}
                    onChange={e => setCitaObservaciones(e.target.value)}
                    maxLength={500}
                    rows={2}
                    placeholder='Ej: Traer carnet de vacunas, ayuno previo...'
                    className='w-full p-2.5 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white transition-all duration-200 text-step--1 resize-none'
                  />
                  <p className='text-step--2 text-gray-400 text-right'>
                    {citaObservaciones.length}/500
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className='flex gap-3'>
          <button
            type='button'
            onClick={() => router.push('/dashboard/fichas')}
            className='flex-1 py-3 px-4 border-2 border-gray-300 text-gray-600 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-200 cursor-pointer'
          >
            {tratamientosRegistrados.length > 0 ? 'Finalizar' : 'Cancelar'}
          </button>
          <button
            type='submit'
            disabled={createTratamiento.isPending || !selectedEsquemaId}
            className='flex-1 py-3 px-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {createTratamiento.isPending
              ? 'Registrando...'
              : tratamientosRegistrados.length > 0
                ? 'Registrar otro tratamiento'
                : 'Registrar Tratamiento'}
          </button>
        </div>
      </form>
    </section>
  )
}
