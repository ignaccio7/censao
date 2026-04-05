// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import { FichaUpdateData } from '../dashboard/fichas/schemas'

export function useFichas(refetchInterval: number | false = false) {
  const queryClient = useQueryClient()

  // Obtener fichas
  const fichasQuery = useQuery({
    queryKey: ['fichas'],
    queryFn: async () => {
      const response = await apiClient.get('/fichas')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval
  })

  // Registrar ficha
  const createFicha = useMutation({
    mutationFn: async (newFicha: any) => {
      const response = await apiClient.post('fichas', newFicha)
      return response.data
    },
    onSuccess: (data: any) => {
      // Refresca la lista de fichas luego de crear
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['especialidad'] })
      console.log('DATA EN EL ONSUCCESS')

      console.log(data)
    }
  })

  // Actualizar ficha
  const updateFicha = useMutation({
    mutationFn: async (data: FichaUpdateData) => {
      const response = await apiClient.patch('fichas', data)
      return response.data
    },

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['espcialidad'] })
      console.log('PATCH FICHAS')
      console.log(data)
    }
  })

  return {
    // ...fichasQuery, // expone data, isLoading, error, etc
    fichas: fichasQuery.data || [],
    isLoading: fichasQuery.isLoading,
    error: fichasQuery.error,
    isError: fichasQuery.isError,
    isSuccess: fichasQuery.isSuccess,
    refetch: fichasQuery.refetch,
    // Mutations
    createFicha,
    updateFicha
  }
}
