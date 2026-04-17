// oxlint-disable consistent-type-imports
'use client'
import {
  IconCredential,
  IconSchedule,
  IconStethoscope,
  IconUser,
  IconHistory
} from '@/app/components/icons/icons'
import { useFichas } from '@/app/services/fichas'
import { useEspecialidades } from '@/app/services/disponibilidad/especialidades'
import { useState } from 'react'
import { toast } from 'sonner'
import useModal from '@/hooks/useModal'
import { StateRecord } from '@/lib/constants'

interface FormReassignProps {
  fichaId: string
  pacienteNombres: string
  pacienteCedula: string
}

export default function FormReassign({
  fichaId,
  pacienteNombres,
  pacienteCedula
}: FormReassignProps) {
  const { especialidades } = useEspecialidades()
  const { updateFicha } = useFichas()
  const { closeModal } = useModal()

  const [especialidad, setEspecialidad] = useState('')
  const [doctor, setDoctor] = useState('')

  const doctoresDisponibles = especialidad
    ? especialidades.find(esp => esp.id === especialidad)?.doctores || []
    : []

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!especialidad || !doctor) {
      toast.error('Seleccione una especialidad y un doctor')
      return
    }

    try {
      const result = await updateFicha.mutateAsync({
        id: fichaId,
        status: StateRecord.ADMISION,
        especialidad,
        doctor
      })

      if (result.success) {
        toast.success(result.message || 'Paciente reasignado exitosamente')
      } else {
        toast.error(result.message || 'Error al reasignar el paciente')
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Error al reasignar el paciente'
      )
    } finally {
      closeModal()
    }
  }

  return (
    <div className='form-reassign'>
      <h3 className='text-step-0 text-gray-600'>
        Seleccione la nueva especialidad y doctor para reasignar al paciente
      </h3>

      <form
        className='my-2 md:my-4 grid grid-cols-1 md:grid-cols-2 gap-4'
        onSubmit={onSubmit}
      >
        {/* Cédula (readonly) */}
        <label
          htmlFor='reassign-cedula'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconCredential />
            Cédula
          </span>
          <input
            className='p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'
            type='text'
            id='reassign-cedula'
            value={pacienteCedula}
            disabled
          />
        </label>

        {/* Nombre (readonly) */}
        <label
          htmlFor='reassign-nombre'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconUser />
            Nombre Completo
          </span>
          <input
            className='p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'
            type='text'
            id='reassign-nombre'
            value={pacienteNombres}
            disabled
          />
        </label>

        {/* Especialidad */}
        <label
          htmlFor='reassign-especialidad'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconStethoscope />
            Nueva Especialidad Médica
          </span>
          <select
            id='reassign-especialidad'
            value={especialidad}
            onChange={e => {
              setEspecialidad(e.target.value)
              setDoctor('')
            }}
            className='p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors border-transparent focus:border-primary-600 focus:ring-primary-600'
          >
            <option value=''>Seleccione una especialidad</option>
            {especialidades?.map(esp => (
              <option key={esp.id} value={esp.id}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </label>

        {/* Doctor */}
        <label
          htmlFor='reassign-doctor'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconSchedule />
            Nuevo Doctor disponible
          </span>
          <select
            id='reassign-doctor'
            value={doctor}
            onChange={e => setDoctor(e.target.value)}
            disabled={!especialidad || doctoresDisponibles.length === 0}
            className='p-2 border rounded-md focus:outline-none focus:ring-1 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed border-transparent focus:border-primary-600 focus:ring-primary-600'
          >
            <option value=''>
              {!especialidad
                ? 'Primero seleccione una especialidad'
                : doctoresDisponibles.length === 0
                  ? 'No hay doctores disponibles'
                  : 'Seleccione un doctor'}
            </option>
            {doctoresDisponibles.map((doc: any) => (
              <option key={doc.id} value={doc.id}>
                {doc.nombre} • {doc.capacidadActual}/{doc.capacidadMaxima}{' '}
                pacientes
              </option>
            ))}
          </select>
        </label>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={updateFicha.isPending || !especialidad || !doctor}
          className='w-full bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer flex gap-2 items-center justify-center col-span-1 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {updateFicha.isPending ? (
            <>
              <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
              Reasignando...
            </>
          ) : (
            <>
              <IconHistory />
              Reasignar paciente
            </>
          )}
        </button>
      </form>
    </div>
  )
}
