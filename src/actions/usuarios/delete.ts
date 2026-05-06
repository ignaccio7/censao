'use server'

//TODO: ver el flujo para este eliminar para ver si quitarlo o mantenerlo en caso de que si tengamos que eliminar un usuario
import prisma from '@/lib/prisma/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteUser(id: string) {
  await prisma.usuarios.delete({
    where: {
      usuario_id: id
    }
  })
  revalidatePath('/dashboard/admin/usuarios')
  // try {
  //   await prisma.usuarios.delete({
  //     where: {
  //       usuario_id: id
  //     }
  //   })

  //   revalidatePath('/dashboard/admin/usuarios')
  //   return {
  //     success: true,
  //     message: 'Usuario eliminado exitosamente'
  //   }
  // } catch (error) {
  //   console.error('Error eliminando usuario:', error)
  //   return {
  //     success: false,
  //     message: 'Error al eliminar el usuario'
  //   }
  // }
}
