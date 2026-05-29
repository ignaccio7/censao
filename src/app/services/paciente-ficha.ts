// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useQuery } from '@tanstack/react-query'
import apiClient from './client'
// import { StateRecord } from '@/lib/constants'

export interface FichaHoyDTO {
  ficha_id: string
  orden_turno: number
  nro_ficha: number
  es_programada: boolean
  estado: string
  turno_codigo: string
  turno_label: string
  doctor_nombre: string | null
  especialidad_nombre: string | null
}

export function useFichaHoy() {
  return useQuery({
    queryKey: ['ficha-hoy'],
    queryFn: async (): Promise<FichaHoyDTO | null> => {
      const response = await apiClient.get('/paciente/ficha-hoy')
      return response.data.data
    },
    staleTime: 0,
    refetchInterval: 60_000, // Polling cada 60 segundos
    refetchOnWindowFocus: true
  })
}
