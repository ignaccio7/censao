const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

const delay = (seconds: number): Promise<boolean> =>
  new Promise(resolve => setTimeout(() => resolve(true), seconds * 1000))

const getPermissions = (routes: any) => {
  const permissions = Object.values(
    routes.reduce((acc: any, route: any) => {
      const label = capitalize(route.module.replaceAll('_', ' '))
      if (!acc[route.module]) {
        acc[route.module] = { label, options: [] }
      }
      acc[route.module].options.push(route)
      return acc
    }, {})
  )
  return permissions
}

export { capitalize, delay, getPermissions }
