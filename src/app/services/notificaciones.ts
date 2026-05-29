// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'

export interface NotificacionAPI {
  id: string
  titulo: string
  mensaje: string
  fecha_envio: string // ISO string
  leido: boolean
  medio: string // 'system' | 'email'
  cita_id: string
  tipo_cita: string | null
}

interface NotificacionesResponse {
  success: boolean
  data: NotificacionAPI[]
  no_leidas: number
}

export function useNotificaciones() {
  const queryClient = useQueryClient()

  const notificacionesQuery = useQuery<NotificacionesResponse>({
    queryKey: ['notificaciones'],
    queryFn: async () => {
      const response = await apiClient.get('/notificaciones')
      return response.data
    },
    staleTime: 2 * 60 * 1000 // 2 minutos
  })

  // Marca todas las no leídas como leídas
  const marcarLeidas = useMutation({
    mutationFn: async () => {
      const response = await apiClient.patch('/notificaciones')
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificaciones'] })
    }
  })

  const notificaciones = notificacionesQuery.data?.data ?? []
  const noLeidas = notificacionesQuery.data?.no_leidas ?? 0

  return {
    notificaciones,
    noLeidas,
    isLoading: notificacionesQuery.isLoading,
    isError: notificacionesQuery.isError,
    refetch: notificacionesQuery.refetch,
    marcarLeidas
  }
}
