import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import type {
  CrearPacienteFormData,
  EditarPacienteFormData
} from '@/app/dashboard/atencion/pacientes/schemas'

export type PacienteItem = {
  paciente_id: string
  sexo: string | null
  grupo_sanguineo: string | null
  fecha_nacimiento: Date | null
  nro_historia_clinica: string | null
  personas: {
    ci: string
    nombres: string
    paterno: string | null
    materno: string | null
    telefono: string | null
    correo: string | null
    direccion: string | null
  }
  fichas?: any[]
  tratamientos?: any[]
  _count?: {
    fichas: number
  }
}

export function usePacientes(params?: {
  search?: string
  huerfanas?: boolean
}) {
  const queryClient = useQueryClient()
  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.set('search', params.search)
  if (params?.huerfanas) queryParams.set('huerfanas', 'true')

  const pacientesQuery = useQuery({
    queryKey: ['atencion-pacientes', params ?? {}],
    queryFn: async () => {
      const response = await apiClient.get(
        `/atencion/pacientes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      )
      return response.data.data as PacienteItem[]
    },
    staleTime: 5 * 60 * 1000
  })

  // Mutation para crear un nuevo paciente
  const createPaciente = useMutation({
    mutationFn: async (data: CrearPacienteFormData) => {
      const response = await apiClient.post('/atencion/pacientes', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
      queryClient.invalidateQueries({
        queryKey: ['atencion-pacientes-huerfanas']
      })
    }
  })

  // Mutation para editar un paciente
  const updatePaciente = useMutation({
    mutationFn: async ({
      pacienteId,
      data
    }: {
      pacienteId: string
      data: EditarPacienteFormData
    }) => {
      const response = await apiClient.patch(
        `/atencion/pacientes/${pacienteId}`,
        data
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['atencion-pacientes'] })
      queryClient.invalidateQueries({
        queryKey: ['atencion-paciente', variables.pacienteId]
      })
    }
  })

  return {
    pacientes: pacientesQuery.data || [],
    isLoading: pacientesQuery.isLoading,
    isError: pacientesQuery.isError,
    error: pacientesQuery.error,
    refetch: pacientesQuery.refetch,
    createPaciente,
    updatePaciente
  }
}

export function usePaciente(pacienteId?: string) {
  return useQuery({
    queryKey: ['atencion-paciente', pacienteId],
    queryFn: async () => {
      const response = await apiClient.get(`/atencion/pacientes/${pacienteId}`)
      return response.data.data as PacienteItem
    },
    enabled: Boolean(pacienteId),
    staleTime: 5 * 60 * 1000
  })
}
