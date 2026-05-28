// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import apiClient from './client'
import { FichaUpdateFormData } from '../dashboard/fichas/schemas'

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

  const errorMessage = fichasQuery.error
    ? ((fichasQuery.error as any)?.response?.data?.error ??
      fichasQuery.error.message ??
      'Error desconocido')
    : null

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
    mutationFn: async (data: FichaUpdateFormData) => {
      const response = await apiClient.patch('fichas', data)
      return response.data
    },

    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['especialidad'] })
      console.log('PATCH FICHAS')
      console.log(data)
    },
    onError: (error: any) => {
      console.log('Error en al actualizar')
      console.log(error)
    }
  })

  // Generar fichas programadas del turno actual desde citas PENDIENTE
  const generarProgramadas = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('fichas/generar-programadas')
      return response.data
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      const { generadas = 0, omitidas = 0 } = data
      if (generadas === 0) {
        toast.info('No había citas pendientes para generar en este turno.')
      } else {
        toast.success(
          `✅ ${generadas} ficha(s) programada(s) generadas correctamente.${omitidas > 0 ? ` ${omitidas} omitidas.` : ''}`
        )
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ?? 'Error al generar fichas programadas'
      toast.error(`❌ ${msg}`)
    }
  })

  return {
    // ...fichasQuery, // expone data, isLoading, error, etc
    fichas: fichasQuery.data || [],
    isLoading: fichasQuery.isLoading,
    error: fichasQuery.error,
    errorMessage,
    isError: fichasQuery.isError,
    isSuccess: fichasQuery.isSuccess,
    refetch: fichasQuery.refetch,
    // Mutations
    createFicha,
    updateFicha,
    generarProgramadas
  }
}

export function useFichaDetalle(fichaId: string | null) {
  return useQuery({
    queryKey: ['ficha-detalle', fichaId],
    queryFn: async () => {
      const res = await apiClient.get(`/fichas/${fichaId}`)
      return res.data.data
    },
    enabled: !!fichaId
  })
}
