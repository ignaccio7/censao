// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useQuery } from '@tanstack/react-query'
import apiClient from './client'

export interface FichaPublicaEspecialidad {
  especialidad_nombre: string
  doctor_nombre: string
  atendiendo: number | null
  siguiente: number | null
  total_pendientes: number
}

export interface FichasPublicasData {
  turno: 'AM' | 'PM'
  fecha: string
  especialidades: FichaPublicaEspecialidad[]
}

export function useFichasPublico(refetchInterval: number | false = false) {
  const fichasPublicasQuery = useQuery<FichasPublicasData>({
    queryKey: ['fichas-publico'],
    queryFn: async () => {
      const response = await apiClient.get('/fichas/publico')
      return response.data.data
    },
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval
  })

  return {
    data: fichasPublicasQuery.data,
    isLoading: fichasPublicasQuery.isLoading,
    isError: fichasPublicasQuery.isError,
    error: fichasPublicasQuery.error,
    refetch: fichasPublicasQuery.refetch
  }
}
