'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { IconTrash } from '@/app/components/icons/icons'

export function DeleteVacunaButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (
      !confirm(
        '¿Eliminar esta vacuna? Se eliminarán también sus esquemas de dosis.'
      )
    )
      return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/vacunas/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        toast.success('Vacuna eliminada correctamente')
        router.refresh()
      } else {
        toast.error(data.message ?? 'Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      title='Eliminar'
      className='px-2 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
    >
      {loading ? (
        <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
      ) : (
        <IconTrash />
      )}
    </button>
  )
}
