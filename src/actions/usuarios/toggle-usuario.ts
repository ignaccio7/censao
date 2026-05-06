'use server'

import prisma from '@/lib/prisma/prisma'
import { revalidatePath } from 'next/cache'
import AuthService from '@/lib/services/auth-service'
import { redirect } from 'next/navigation'

export async function toggleUsuario(usuarioId: string, estado: boolean) {
  try {
    const validation = await AuthService.validateApiPermission(
      '/api/admin/usuarios/:uuid',
      'PATCH'
    )

    if (!validation.success) {
      redirect('/dashboard')
    }

    const userId = validation.data?.id

    // Verificar que el usuario existe
    const usuario = await prisma.usuarios.findUnique({
      where: { usuario_id: usuarioId, eliminado_en: null }
    })

    if (!usuario) {
      return {
        success: false,
        message: 'Usuario no encontrado'
      }
    }

    // Actualizar estado
    await prisma.usuarios.update({
      where: { usuario_id: usuarioId },
      data: {
        activo: estado,
        actualizado_en: new Date(),
        actualizado_por: userId
      }
    })

    // Revalidar la página para actualizar la tabla
    revalidatePath('/dashboard/admin/usuarios')

    return {
      success: true,
      message: `Usuario ${estado ? 'activado' : 'desactivado'} correctamente`
    }
  } catch (error) {
    console.error('[toggleUsuario]', error)
    return {
      success: false,
      message: 'Error al cambiar el estado del usuario'
    }
  }
}
