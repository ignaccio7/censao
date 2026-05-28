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
import { toast } from 'sonner'
import useModal from '@/hooks/useModal'
import { StateRecord } from '@/lib/constants'

interface FormReassignProps {
  fichaId: string
  pacienteNombres: string
  pacienteCedula: string
  especialidadId?: string
  doctorId?: string
  especialidadNombre?: string
  doctorNombre?: string
}

export default function FormReassign({
  fichaId,
  pacienteNombres,
  pacienteCedula,
  // especialidadId,
  // doctorId,
  especialidadNombre,
  doctorNombre
}: FormReassignProps) {
  const { updateFicha } = useFichas()
  const { closeModal } = useModal()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await updateFicha.mutateAsync({
        id: fichaId,
        status: StateRecord.EN_ESPERA
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
      <h3 className='text-step-0 text-gray-600 mb-4'>
        El paciente será reasignado a su doctor original y volverá a la sala de
        espera.
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

        {/* Especialidad (readonly) */}
        <label
          htmlFor='reassign-especialidad'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconStethoscope />
            Especialidad
          </span>
          <input
            className='p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'
            type='text'
            id='reassign-especialidad'
            value={especialidadNombre || 'Sin asignar'}
            disabled
          />
        </label>

        {/* Doctor (readonly) */}
        <label
          htmlFor='reassign-doctor'
          className='text-step-0 w-full flex flex-col gap-1'
        >
          <span className='font-semibold flex gap-1 items-center'>
            <IconSchedule />
            Doctor
          </span>
          <input
            className='p-2 border rounded-md bg-gray-100 text-gray-500 cursor-not-allowed border-transparent'
            type='text'
            id='reassign-doctor'
            value={doctorNombre || 'Sin asignar'}
            disabled
          />
        </label>

        {/* Submit Button */}
        <button
          type='submit'
          disabled={updateFicha.isPending}
          className='w-full mt-4 bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer flex gap-2 items-center justify-center col-span-1 md:col-span-2 disabled:opacity-50 disabled:cursor-not-allowed'
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
