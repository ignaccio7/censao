'use client'

import { toast } from 'sonner'
import useModal from '@/hooks/useModal'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/app/services/client'

interface ConfirmDeletePacienteProps {
  pacienteId: string
  nombreCompleto: string
}

export default function ConfirmDeletePaciente({
  pacienteId,
  nombreCompleto
}: ConfirmDeletePacienteProps) {
  const { closeModal } = useModal()
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.delete(
        `atencion/pacientes/${pacienteId}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
      toast.success('Paciente eliminado exitosamente')
      closeModal()
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 'Error al eliminar el paciente'
      )
    }
  })

  return (
    <div className='flex flex-col gap-4 text-center pb-4'>
      <p className='text-gray-600 mt-2 text-lg'>
        ¿Estás seguro que deseas eliminar al paciente{' '}
        <strong className='text-gray-800 font-bold'>{nombreCompleto}</strong>?
      </p>
      <p className='text-red-500 text-sm'>Esta acción no se puede deshacer.</p>
      <div className='flex justify-center gap-4 mt-6'>
        <button
          onClick={closeModal}
          className='px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium'
          disabled={mutation.isPending}
        >
          Cancelar
        </button>
        <button
          onClick={() => mutation.mutate()}
          className='px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center min-w-[120px]'
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
          ) : (
            'Sí, eliminar'
          )}
        </button>
      </div>
    </div>
  )
}
