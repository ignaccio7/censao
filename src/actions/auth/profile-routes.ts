'use server'

import { auth } from '@/auth'
import AuthService from '@/lib/services/auth-service'

export async function getProfileRoutes() {
  console.log('Obteniendo el sidebar******************************')
  const session = await auth()
  console.log('*******sidebarsesion*********', session)

  if (!session || !session.user?.id) {
    return null
  }

  console.log('Intenta obtener rutas')
  try {
    const routes = await AuthService.getProfilePermissions(session.user.id)
    return routes?.permisos
  } catch (error) {
    console.log('Error al obtener el sidebar')
    console.log(error)
    return null
  }
}
