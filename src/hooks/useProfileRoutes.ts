'use client'

import { getProfileRoutes } from '@/actions/auth/profile-routes'
import useProfileRoutesStore from '@/store/profile-routes'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { delay } from '@/app/utils'
import { usePathname } from 'next/navigation'

export default function useProfileRoutes() {
  const pathName = usePathname()
  console.log(pathName)

  const { data: session, status } = useSession()
  const { routes, setRoutes, hasPermission, clearRoutes } =
    useProfileRoutesStore()
  const [loadingRoutes, setLoadingRoutes] = useState(true)

  const loadRoutes = async () => {
    try {
      setLoadingRoutes(true)
      await delay(1)
      const response = await getProfileRoutes()

      console.log('La respuesta es ')
      console.log(response)

      if (response) {
        setRoutes(response)
      } else {
        clearRoutes()
      }
    } catch (error) {
      console.log('Error cargando permisos', error)
    } finally {
      setLoadingRoutes(false)
    }
  }

  useEffect(() => {
    // Si no hay sesión, limpiar y no mostrar loading
    // oxlint-disable-next-line exhaustive-deps
    if (status === 'unauthenticated') {
      // oxlint-disable-next-line exhaustive-deps
      clearRoutes()
      setLoadingRoutes(false)
      return
    }

    // Si la sesión aún está cargando, mantener loading en true
    if (status === 'loading') {
      return
    }

    // Si hay sesión y no hay rutas, cargar
    if (
      status === 'authenticated' &&
      session?.user?.id &&
      routes.length === 0
    ) {
      loadRoutes()
    } else if (status === 'authenticated' && routes.length > 0) {
      // Si ya hay rutas, quitar loading
      setLoadingRoutes(false)
    }
  }, [session?.user?.id])

  // Está cargando si la sesión está cargando O si están cargando las rutas
  const loading = status === 'loading' || loadingRoutes

  return {
    routes,
    clearRoutes,
    loading,
    read: hasPermission(pathName, 'read'),
    create: hasPermission(pathName, 'create'),
    update: hasPermission(pathName, 'update'),
    delete: hasPermission(pathName, 'delete')

    // read: (route: string) => hasPermission(route, 'read'),
    // create: (route: string) => hasPermission(route, 'create'),
    // update: (route: string) => hasPermission(route, 'update'),
    // delete: (route: string) => hasPermission(route, 'delete')
  }
}
