import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    username: string
    name: string
    role: string
    roleDescription: string
    permisos: string[]
  }

  interface Session {
    user: {
      id: string
      username: string
      name: string
      role: string
      roleDescription: string
      permisos: string[]
    }
  }
}
