import { create } from 'zustand'

export interface Route {
  link: string
  methods: string[]
  description: string
  icon: string
  module: string
  name: string
}

interface ProfileRoutesState {
  routes: Route[]
  setRoutes: (routes: Route[]) => void
  hasPermission: (route: string, method?: string) => boolean
  clearRoutes: () => void
}

const useProfileRoutesStore = create<ProfileRoutesState>((set, get) => ({
  routes: [],
  setRoutes: routes => set({ routes: routes }),
  hasPermission: (route, method = 'read') => {
    const { routes } = get()
    console.log(routes)
    console.log(route)

    const routeMatch = routes.find(perm => perm.link === route)
    if (routeMatch) {
      return routeMatch.methods.includes(method)
    }

    const routeParameterMatch = routes.find(perm => {
      if (perm.link.includes(':')) {
        const pattern = new RegExp(
          // oxlint-disable-next-line prefer-template
          '^' +
            route.replace(
              /:uuid/g,
              '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'
            ) +
            '$',
          'i'
        )
        return pattern.test(route)
      }
      return false
    })

    return routeParameterMatch
      ? routeParameterMatch.methods.includes(method)
      : false
  },
  clearRoutes() {
    set({ routes: [] })
  }
}))

export default useProfileRoutesStore
