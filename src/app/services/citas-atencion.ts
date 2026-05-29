// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useQuery } from '@tanstack/react-query'
import apiClient from './client'

export interface CitaAtencionDTO {
  id: string
  paciente_nombre: string
  paciente_ci: string
  tipo: 'VACUNA' | 'CONTROL' | 'CONSULTA'
  estado: string
  turno_codigo: 'AM' | 'PM'
  turno_label: string
  doctor_nombre: string | null
  fecha_programada: string
  vacuna_nombre: string | null
  dosis_numero: number | null
  observaciones: string | null
}

export function useCitasAtencion(fecha?: string) {
  return useQuery({
    queryKey: ['citas-atencion', fecha ?? 'hoy'],
    queryFn: async (): Promise<CitaAtencionDTO[]> => {
      const params = fecha ? `?fecha=${fecha}` : ''
      const response = await apiClient.get(`/atencion/citas${params}`)
      return response.data.data as CitaAtencionDTO[]
    },
    staleTime: 2 * 60 * 1000
  })
}
