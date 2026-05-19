'use server'

import prisma from '@/lib/prisma/prisma'
import { revalidatePath } from 'next/cache'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'

export async function toggleVacuna(vacunaId: string, estado: boolean) {
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/admin/vacunas/:uuid',
      'PATCH'
    )

    if (!validation.success) {
      redirect('/dashboard')
    }

    const userId = validation.data?.id

    // Verificar que la vacuna existe
    const vacuna = await prisma.vacunas.findUnique({
      where: { id: vacunaId, eliminado_en: null }
    })

    if (!vacuna) {
      return {
        success: false,
        message: 'Vacuna no encontrada'
      }
    }

    // Actualizar estado
    await prisma.vacunas.update({
      where: { id: vacunaId },
      data: {
        activo: estado,
        actualizado_en: new Date(),
        actualizado_por: userId
      }
    })

    // Revalidar la página para actualizar la tabla
    revalidatePath('/dashboard/admin/vacunas')

    return {
      success: true,
      message: `Vacuna ${estado ? 'activada' : 'desactivada'} correctamente`
    }
  } catch (error) {
    console.error('[toggleVacuna]', error)
    return {
      success: false,
      message: 'Error al cambiar el estado de la vacuna'
    }
  }
}
