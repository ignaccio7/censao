// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import {
  ConsultaCreateData,
  ConsultaUpdateData
} from '../dashboard/consultas/schemas'

export function useConsultas() {
  const queryClient = useQueryClient()

  // Listar consultas del doctor
  const consultasQuery = useQuery({
    queryKey: ['consultas'],
    queryFn: async () => {
      const response = await apiClient.get('/consultas')
      return response.data.data
    },
    staleTime: 5 * 60 * 1000
  })

  // Crear consulta
  const createConsulta = useMutation({
    mutationFn: async (data: ConsultaCreateData) => {
      const response = await apiClient.post('consultas', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
    }
  })

  return {
    consultas: consultasQuery.data || [],
    isLoading: consultasQuery.isLoading,
    isError: consultasQuery.isError,
    createConsulta
  }
}

export function useConsultasPaciente(pacienteCi: string) {
  return useQuery({
    queryKey: ['consultas', 'paciente', pacienteCi],
    queryFn: async () => {
      const response = await apiClient.get(`/consultas/paciente/${pacienteCi}`)
      return response.data.data
    },
    enabled: Boolean(pacienteCi),
    staleTime: 5 * 60 * 1000
  })
}

export function useConsultaDetalle(pacienteCi: string, consultaId: string) {
  return useQuery({
    queryKey: ['consultas', 'paciente', pacienteCi, 'detalle', consultaId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/consultas/paciente/${pacienteCi}/detalle/${consultaId}`
      )
      return response.data.data
    },
    enabled: Boolean(pacienteCi) && Boolean(consultaId),
    staleTime: 5 * 60 * 1000
  })
}

export function useConsultaMutations(pacienteCi: string) {
  const queryClient = useQueryClient()

  const updateConsulta = useMutation({
    mutationFn: async ({
      consultaId,
      data
    }: {
      consultaId: string
      data: ConsultaUpdateData
    }) => {
      const response = await apiClient.patch(
        `/consultas/paciente/${pacienteCi}/detalle/${consultaId}`,
        data
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
    }
  })

  const deleteConsulta = useMutation({
    mutationFn: async (consultaId: string) => {
      const response = await apiClient.delete(
        `/consultas/paciente/${pacienteCi}/detalle/${consultaId}`
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultas'] })
    }
  })

  return {
    updateConsulta,
    deleteConsulta
  }
}
