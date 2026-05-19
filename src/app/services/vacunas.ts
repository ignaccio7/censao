import { useMutation } from '@tanstack/react-query'
import apiClient from './client'

interface CreateVacunaResponse {
  success: boolean
  message?: string
  vacuna: {
    id: string
  }
}

export function useVacunas(vacunaId?: string) {
  // const queryClient = useQueryClient()

  // ---- Crear Vacuna
  const createVacuna = useMutation<CreateVacunaResponse, Error, any>({
    mutationFn: async (data: any) => {
      console.log(data)
      const response = await apiClient.post('/admin/vacunas', data)
      console.log(response)
      return response.data
    },
    onSuccess: () => {
      console.log('Vacuna creada exitosamente')
    },
    onError: (error: any) => {
      console.error('Error al crear la vacuna:', error)
    }
  })

  // ---- Editar Vacuna
  const updateVacuna = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.patch(`/admin/vacunas/${vacunaId}`, data)
      return response.data
    }
  })

  return {
    createVacuna,
    updateVacuna
  }
}
