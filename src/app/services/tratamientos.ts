// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import { TratamientoCreateData } from '../dashboard/tratamientos/schemas'

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

  // Crear tratamiento
  const createTratamiento = useMutation({
    mutationFn: async (data: TratamientoCreateData) => {
      const response = await apiClient.post('tratamientos', data)
      return response.data
    },
    onSuccess: () => {
      // Invalidar fichas para reflejar el cambio de estado (ATENDIDA)
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['tratamientos'] })
    }
  })

  return {
    tratamientos: tratamientosQuery.data || [],
    isLoading: tratamientosQuery.isLoading,
    isError: tratamientosQuery.isError,
    createTratamiento
  }
}
