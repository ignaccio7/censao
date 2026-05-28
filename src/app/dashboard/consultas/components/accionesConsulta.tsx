'use client'

import {
  IconHistory,
  IconCalendar,
  IconCheck
} from '@/app/components/icons/icons'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/app/components/ui/modal/modal'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { es } from 'react-day-picker/locale'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/app/services/client'

const TIPOS_CITA = [
  { value: 'CONTROL', label: 'Control médico' },
  { value: 'CONSULTA', label: 'Consulta general' }
]

interface AccionesConsultaProps {
  fichaId: string
  consultaId: string
  motivo: string
  pacienteCi: string
  doctorId?: string
  estadoFicha: string | null
  esSeguimiento?: boolean
  esAbsorbida?: boolean
  isFromPatientePath?: boolean
}

export default function AccionesConsulta({
  fichaId,
  consultaId,
  motivo,
  pacienteCi,
  doctorId,
  estadoFicha,
  esSeguimiento = false,
  esAbsorbida = false,
  isFromPatientePath = false
}: AccionesConsultaProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [modalCita, setModalCita] = useState(false)
  console.log(estadoFicha)

  // Estados para el formulario de cita
  const [citaTipo, setCitaTipo] = useState<'CONTROL' | 'CONSULTA'>('CONTROL')
  const [citaFecha, setCitaFecha] = useState<Date | undefined>()
  const [citaObservaciones, setCitaObservaciones] = useState('')

  const createCitaMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/citas', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
      queryClient.invalidateQueries({ queryKey: ['consultas', 'paciente'] })
      toast.success('Cita de retorno programada exitosamente')
      setModalCita(false)
      // Limpiar formulario
      setCitaFecha(undefined)
      setCitaObservaciones('')
      // Refrescar los datos del servidor
      router.refresh()
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Error al programar cita'
      toast.error(message)
      setModalCita(false)
    }
  })

  const handleCrearCita = () => {
    if (!citaFecha) {
      toast.error('Debes seleccionar una fecha para la cita')
      return
    }

    if (!doctorId) {
      toast.error('No se pudo identificar al doctor asignado a esta ficha')
      return
    }

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

    createCitaMutation.mutate({
      pacienteId: pacienteCi,
      doctorId: doctorId,
      consultaId: consultaId,
      fechaProgramada: appointmentDate.toISOString(),
      tipo: citaTipo,
      observaciones: citaObservaciones.trim() || undefined
    })
  }

  return (
    <>
      <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
        <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
          Acciones Disponibles
        </h3>

        <div className='flex flex-col gap-3'>
          {/* Seguimiento solo si NO es un seguimiento ya y NO está en vista de paciente */}
          {!esSeguimiento && !isFromPatientePath && (
            <>
              <Link
                href={`/dashboard/consultas/${fichaId}/crear?consultaPadreId=${consultaId}`}
                className='w-full py-3 px-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-semibold shadow-sm flex items-center justify-center gap-2 text-center'
              >
                <IconHistory size='20' />
                Registrar Seguimiento
                <span className='sr-only'>de {motivo}</span>
              </Link>
              <p className='text-xs text-gray-500 text-center px-2'>
                Registrar un seguimiento absorberá automáticamente las citas
                pendientes.
              </p>
              <div className='h-px bg-gray-100 w-full my-1'></div>
            </>
          )}

          {/* Cita de retorno: solo si NO está absorbida */}
          {esAbsorbida ? (
            <div className='flex items-start gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-500'>
              <IconCalendar
                size='16'
                className='mt-0.5 shrink-0 text-gray-400'
              />
              <span>
                Las citas futuras se gestionan desde el{' '}
                <strong>seguimiento más reciente</strong>. Esta consulta ya no
                puede agregar más citas.
              </span>
            </div>
          ) : (
            <button
              onClick={() => setModalCita(true)}
              className='w-full py-3 px-4 bg-sky-50 text-sky-700 border border-sky-200 rounded-xl hover:bg-sky-100 hover:border-sky-300 transition-colors font-semibold flex items-center justify-center gap-2 cursor-pointer'
            >
              <IconCalendar size='20' />
              Agregar Cita de Retorno
            </button>
          )}
        </div>
      </div>

      <Modal
        title='Programar Cita de Retorno'
        isOpen={modalCita}
        onClose={() => setModalCita(false)}
      >
        <div className='space-y-4'>
          <div className='bg-sky-50 border border-sky-100 rounded-lg p-3 text-sm text-sky-800 mb-4'>
            Esta cita quedará vinculada automáticamente a la consulta: <br />
            <strong>{motivo}</strong>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='block text-xs font-semibold text-gray-500 mb-1'
              htmlFor='citaTipo'
            >
              TIPO DE CITA
            </label>
            <select
              id='citaTipo'
              value={citaTipo}
              onChange={e =>
                setCitaTipo(e.target.value as 'CONTROL' | 'CONSULTA')
              }
              className='w-full border border-gray-300 rounded-lg p-2 text-sm cursor-pointer focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all'
            >
              {TIPOS_CITA.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='block text-xs font-semibold text-gray-500 mb-1'
              htmlFor='fecha-consulta'
            >
              FECHA (Lunes a Viernes)
            </label>
            <div className='bg-white border border-gray-300 rounded-lg p-2 flex justify-center'>
              <DayPicker
                mode='single'
                selected={citaFecha}
                onSelect={setCitaFecha}
                fromYear={new Date().getFullYear()}
                toYear={new Date().getFullYear() + 5}
                disabled={[
                  { dayOfWeek: [0, 6] },
                  { before: new Date(new Date().setHours(0, 0, 0, 0)) }
                ]}
                styles={{
                  root: {
                    '--rdp-accent-color': '#0284c7'
                  } as React.CSSProperties
                }}
                modifiersClassNames={{
                  selected:
                    'bg-sky-600 text-white rounded-full font-bold shadow-md hover:bg-sky-700',
                  today: 'text-sky-700 font-bold'
                }}
                locale={es}
                captionLayout='dropdown'
              />
            </div>
          </div>

          <div className='flex flex-col gap-1.5'>
            <label
              className='block text-xs font-semibold text-gray-500 mb-1'
              htmlFor='citaObs'
            >
              OBSERVACIONES (opcional)
            </label>
            <input
              id='citaObs'
              type='text'
              value={citaObservaciones}
              onChange={e => setCitaObservaciones(e.target.value)}
              placeholder='Notas para la cita de retorno...'
              maxLength={500}
              className='w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all'
            />
          </div>

          <div className='pt-4 border-t border-gray-100 flex gap-3 mt-6'>
            <button
              onClick={() => setModalCita(false)}
              className='flex-1 py-2.5 px-4 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm cursor-pointer'
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearCita}
              disabled={createCitaMutation.isPending || !citaFecha}
              className='flex-1 py-2.5 px-4 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer'
            >
              {createCitaMutation.isPending ? (
                'Programando...'
              ) : (
                <>
                  <IconCheck size='18' /> Programar Cita
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
