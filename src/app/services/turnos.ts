import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import type { TurnoFormData } from '@/app/dashboard/admin/turnos/schemas'

export function useTurno() {
  const queryClient = useQueryClient()

  const updateTurno = useMutation({
    mutationFn: async (data: TurnoFormData & { codigo: string }) => {
      const { codigo, ...payload } = data
      const response = await apiClient.patch(`/admin/turnos/${codigo}`, payload)
      return response.data
    },
    onSuccess: () => {
      // No hay queryKey de turnos en cliente (es server component)
      // router.refresh() en el modal se encarga de re-fetch del server
      queryClient.invalidateQueries({ queryKey: ['turnos'] })
    }
  })

  return { updateTurno }
}
