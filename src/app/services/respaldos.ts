// src/app/services/respaldos.ts
// oxlint-disable prefer-default-export
// oxlint-disable func-style
'use client'

import { useMutation } from '@tanstack/react-query'
import { signOut } from 'next-auth/react'
import { toast } from 'sonner'
import apiClient from './client'
import type { BackupFile } from '@/app/dashboard/admin/respaldos/interfaces'

// ─── Hook de respaldos ────────────────────────────────────────────────────────
export function useRespaldos() {
  // ── Generar y descargar respaldo ──────────────────────────────────────────
  const generarRespaldo = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post(
        '/admin/respaldos/generar',
        {},
        { responseType: 'blob' }
      )
      return response
    },
    onSuccess: response => {
      // Nombre del archivo con timestamp en hora boliviana para legibilidad
      const fechaBO = new Date()
        .toLocaleString('es-BO', {
          timeZone: 'America/La_Paz',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
        .replace(/[/: ,]/g, '-')

      const filename = `censao-respaldo-${fechaBO}.json`

      // Descarga directa — sin almacenamiento en servidor
      const url = URL.createObjectURL(
        new Blob([response.data], { type: 'application/json' })
      )
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success('Respaldo generado y descargado correctamente')
    },
    onError: () => {
      toast.error('Error al generar el respaldo. Intente de nuevo.')
    }
  })

  // ── Restaurar desde archivo ───────────────────────────────────────────────
  const restaurarRespaldo = useMutation({
    mutationFn: async (backup: BackupFile) => {
      const response = await apiClient.post(
        '/admin/respaldos/restaurar',
        backup
      )
      return response.data
    },
    onSuccess: async () => {
      toast.success(
        'Base de datos restaurada correctamente. Cerrando sesión...'
      )
      // signOut() explícito para limpiar la cookie de NextAuth del navegador.
      // Evita que quede una sesión activa con datos que ya no coincidan con la BD restaurada.
      await signOut({ callbackUrl: '/auth/ingresar' })
    },
    onError: (error: any) => {
      const mensaje =
        error?.response?.data?.message ??
        'Error al restaurar. La operación fue revertida completamente. La base de datos permanece sin cambios.'
      toast.error(mensaje)
    }
  })

  return { generarRespaldo, restaurarRespaldo }
}
