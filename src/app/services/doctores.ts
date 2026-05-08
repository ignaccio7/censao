import { useMutation } from '@tanstack/react-query'
import apiClient from './client'

interface AssignAvailabilitiesAndSpecialtiesPayload {
  matricula?: string
  especialidades: {
    especialidad_id: string
    disponibilidades: {
      turno_codigo: string
      cupos: number
      estado: boolean
    }[]
  }[]
}

export function useDoctor(doctorId: string) {
  // const queryClient = useQueryClient()

  // Asignacion de disponibilidades y especialidades
  const assignAvailabilitiesAndSpecialties = useMutation({
    mutationFn: async (data: AssignAvailabilitiesAndSpecialtiesPayload) => {
      const response = await apiClient.patch(
        `/admin/doctores/${doctorId}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      console.log('Registro asignado existosamente')
    },
    onError: (error: any) => {
      console.error('[Error al asignar]', error)
    }
  })

  return {
    assignAvailabilitiesAndSpecialties
  }
}
