// src/app/services/usuarios.ts
// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'
import type {
  CreateUsuarioFormData,
  UpdateUsuarioFormData
} from '@/app/dashboard/admin/usuarios/schemas'

// ─── Tipos de respuesta ───────────────────────────────────────────────────────
export interface UsuarioListItem {
  usuario_id: string
  persona_ci: string
  username: string
  activo: boolean
  creado_en: string
  personas: {
    ci: string
    nombres: string
    paterno: string | null
    materno: string | null
    correo: string | null
    telefono: string | null
  }
  usuarios_roles: Array<{
    rol_id: string
    roles: {
      id: string
      nombre: string
    }
  }>
}

export interface UsuariosMeta {
  total: number
  page: number
  numberPerPage: number
  totalPages: number
}

// ─── Hook principal ───────────────────────────────────────────────────────────
export function useUsuarios(params?: {
  search?: string
  page?: number
  limit?: number
}) {
  const queryClient = useQueryClient()

  const queryParams = new URLSearchParams()
  if (params?.search) queryParams.set('search', params.search)
  if (params?.page) queryParams.set('page', String(params.page))
  if (params?.limit) queryParams.set('limit', String(params.limit))

  // ── Listar usuarios ────────────────────────────────────────────────────────
  const usuariosQuery = useQuery({
    queryKey: ['usuarios', params],
    queryFn: async () => {
      const response = await apiClient.get(
        `/admin/usuarios?${queryParams.toString()}`
      )
      return response.data as { data: UsuarioListItem[]; meta: UsuariosMeta }
    },
    staleTime: 5 * 60 * 1000
  })

  const errorMessage = usuariosQuery.error
    ? ((usuariosQuery.error as any)?.response?.data?.message ??
      (usuariosQuery.error as any)?.response?.data?.error ??
      usuariosQuery.error.message ??
      'Error desconocido')
    : null

  // ── Crear usuario ──────────────────────────────────────────────────────────
  const createUsuario = useMutation({
    mutationFn: async (
      data: Omit<CreateUsuarioFormData, 'confirmar_password'>
    ) => {
      const response = await apiClient.post('/admin/usuarios', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    },
    onError: (error: any) => {
      console.log('viene aqui con error')
      console.error('[createUsuario]', error)
    }
  })

  return {
    // Query
    usuarios: usuariosQuery.data?.data ?? [],
    meta: usuariosQuery.data?.meta,
    isLoading: usuariosQuery.isLoading,
    isError: usuariosQuery.isError,
    isSuccess: usuariosQuery.isSuccess,
    error: usuariosQuery.error,
    errorMessage,
    refetch: usuariosQuery.refetch,
    // Mutations
    createUsuario
  }
}

// Hook para un usuario individual (edición)
export function useUsuario(uuid: string) {
  const queryClient = useQueryClient()

  const updateUsuario = useMutation({
    mutationFn: async (data: UpdateUsuarioFormData) => {
      // Quitar confirmar_password antes de enviar
      const { confirmar_password, ...payload } = data
      console.log(confirmar_password) // TODO: quitar error linter de no usar variables no usadas

      // Si password vacío, no enviarlo
      if (!payload.password || payload.password === '') {
        delete (payload as any).password
      }
      const response = await apiClient.patch(`/admin/usuarios/${uuid}`, payload)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] })
    }
  })

  return { updateUsuario }
}
