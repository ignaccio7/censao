// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import {
  TratamientoCreateData,
  TratamientoBatchCreateData
} from '../dashboard/tratamientos/schemas'

export type TratamientoUpdateData = {
  observaciones?: string | null
}

export function useTratamientos() {
  const queryClient = useQueryClient()

  // Listar tratamientos del doctor
  const tratamientosQuery = useQuery({
    queryKey: ['tratamientos'],
    queryFn: async () => {
      const response = await apiClient.get('/tratamientos')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000
  })

  // Crear tratamiento (legacy — un solo tratamiento - ya no esta siendo utilizado)
  const createTratamiento = useMutation({
    mutationFn: async (data: TratamientoCreateData) => {
      const response = await apiClient.post('tratamientos', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['tratamientos'] })
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
    }
  })

  // Crear tratamientos en BATCH — una sola transacción
  const createTratamientoBatch = useMutation({
    mutationFn: async (data: TratamientoBatchCreateData) => {
      const response = await apiClient.post('tratamientos/batch', data)
      return response.data
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['tratamientos'] })
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
      const pacienteId = variables?.pacienteId
      if (pacienteId) {
        queryClient.invalidateQueries({
          queryKey: ['atencion-paciente', pacienteId]
        })
      }
    }
  })

  // Editar observaciones de un tratamiento
  const updateTratamiento = useMutation({
    mutationFn: async ({
      id,
      data
    }: {
      id: string
      data: TratamientoUpdateData
    }) => {
      const response = await apiClient.patch(`tratamientos/${id}`, data)
      return response.data
    }
    // onSuccess: invalidate
  })

  return {
    tratamientos: tratamientosQuery.data || [],
    isLoading: tratamientosQuery.isLoading,
    isError: tratamientosQuery.isError,
    createTratamiento,
    updateTratamiento,
    createTratamientoBatch
  }
}
