import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import type {
  CrearPacienteFormData,
  EditarPacienteFormData
} from '@/app/dashboard/atencion/pacientes/schemas'

export function usePacientes() {
  const queryClient = useQueryClient()

  // Mutation para crear un paciente nuevo
  const createPaciente = useMutation({
    mutationFn: async (data: CrearPacienteFormData) => {
      const response = await apiClient.post('/atencion/pacientes', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
      queryClient.invalidateQueries({
        queryKey: ['atencion-pacientes-huerfanas']
      })
    }
  })

  // Mutation para editar un paciente
  const updatePaciente = useMutation({
    mutationFn: async ({
      pacienteId,
      data
    }: {
      pacienteId: string
      data: EditarPacienteFormData
    }) => {
      const response = await apiClient.patch(
        `/atencion/pacientes/${pacienteId}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
    }
  })

  return {
    createPaciente,
    updatePaciente
  }
}
