'use client'

import { getProfileRoutes } from '@/actions/auth/profile-routes'
import useProfileRoutesStore from '@/store/profile-routes'
import { useEffect } from 'react'

export default function useProfileRoutes() {
  const { routes, setRoutes, hasPermission } = useProfileRoutesStore()

  const loadRoutes = async () => {
    try {
      const response = await getProfileRoutes()
      console.log('La respuesta es ')
      console.log(response)

      if (response) {
        setRoutes(response)
      }
    } catch (error) {
      console.log('Error cargando permisos', error)
    }
  }

  useEffect(() => {
    // oxlint-disable-next-line exhaustive-deps
    if (routes.length === 0) {
      loadRoutes()
    }
  }, [])

  return {
    routes,
    read: (route: string) => hasPermission(route, 'read'),
    create: (route: string) => hasPermission(route, 'create'),
    update: (route: string) => hasPermission(route, 'update'),
    delete: (route: string) => hasPermission(route, 'delete')
  }
}
