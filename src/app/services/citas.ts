// src/app/services/citas.ts
// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'

export type CitaCreateData = {
  tratamientoId?: string
  consultaId?: string
  fechaProgramada: string
  tipo: 'VACUNA' | 'CONTROL' | 'CONSULTA'
  observaciones?: string
}

export type CitaUpdateData = {
  fechaProgramada?: string
  tipo?: 'VACUNA' | 'CONTROL' | 'CONSULTA'
  observaciones?: string | null
}

export function useCitas(pacienteId?: string) {
  const queryClient = useQueryClient()

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['tratamientos-detalle', pacienteId]
    })
    queryClient.invalidateQueries({ queryKey: ['tratamientos'] })
  }

  // Crear nueva cita desde el detalle del tratamiento
  const createCita = useMutation({
    mutationFn: async (data: CitaCreateData) => {
      const response = await apiClient.post('citas', data)
      return response.data
    },
    onSuccess: invalidate
  })

  // Modificar cita (fecha / tipo / observaciones)
  const updateCita = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CitaUpdateData }) => {
      const response = await apiClient.patch(`citas/${id}`, data)
      return response.data
    },
    onSuccess: invalidate
  })

  // Cancelar cita (soft-cancel)
  const cancelCita = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`citas/${id}`)
      return response.data
    },
    onSuccess: invalidate
  })

  return {
    createCita,
    updateCita,
    cancelCita
  }
}
