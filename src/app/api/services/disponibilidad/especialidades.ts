// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useQuery } from '@tanstack/react-query'
import apiClient from '../client'

export function useEspecialidades() {
  // const queryClient = useQueryClient()

  const especialidadesQuery = useQuery({
    queryKey: ['especialidad'],
    queryFn: async () => {
      const response = await apiClient.get('/especialidad')
      return response.data
    }
  })

  return {
    especialidadesQuery
  }
}
