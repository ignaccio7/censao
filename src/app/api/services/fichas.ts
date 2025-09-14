// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'

export function useFichas() {
  const queryClient = useQueryClient()

  // Obtener fichas
  const fichasQuery = useQuery({
    queryKey: ['fichas'],
    queryFn: async () => {
      const response = await apiClient.get('/fichas')
      return response.data
    },
    staleTime: 5 * 60 * 1000
  })

  // Registrar ficha
  const createFicha = useMutation({
    mutationFn: async (newFicha: any) => {
      const response = await apiClient.post('fichas', newFicha)
      return response.data
    },
    onSuccess: () => {
      // Refresca la lista de fichas luego de crear
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
    }
  })

  return {
    ...fichasQuery, // expone data, isLoading, error, etc
    createFicha
  }
}
