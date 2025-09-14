// oxlint-disable no-console
// oxlint-disable no-magic-numbers
// oxlint-disable new-cap
// oxlint-disable id-length
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import AuthService from './lib/services/auth-service'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: 'auth/ingresar'
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 15
  },

  callbacks: {
    jwt: async ({ token, user }) => {
      console.log('🔄 JWT callback - ANTES:', { token, user })

      // Solo en el primer login (cuando user existe)
      if (user) {
        console.log('📝 Primer login - estructurando token limpiamente')

        // Tomamos los datos de user y los estructuramos bien
        token.id = user.id
        token.username = user.username
        token.name = user.name
        token.role = user.role
        token.roleDescription = user.roleDescription
        token.permisos = user.permisos
      }

      console.log('🔄 JWT callback - DESPUÉS:', token)
      return token
    },
    session: async ({ session, token }) => {
      console.log('🔄 SESSION callback - ANTES:', { session, token })

      // Aquí tomas SOLO los datos limpios del token
      if (token) {
        session.user = {
          id: token.id as string,
          email: '',
          image: '',
          emailVerified: null,
          username: token.username as string,
          name: token.name as string,
          role: token.role as string,
          roleDescription: token.roleDescription as string,
          permisos: token.permisos as string[]
        }
      }

      console.log('🔄 SESSION callback - DESPUÉS:', session)
      return session
    }
  },

  events: {
    async signIn(user) {
      console.log(`🎉 Usuario ha iniciado sesión exitosamente`)
      console.log(user)
    },

    async signOut(user) {
      console.log('👋 Usuario cerrando sesión')
      console.log(user)
    }
  },

  providers: [
    Credentials({
      credentials: {
        username: {
          label: 'Usuario',
          type: 'text',
          placeholder: 'Digite su nombre de usuario'
        },
        password: {
          label: 'Contraseña',
          type: 'password',
          placeholder: 'Digite su contraseña'
        }
      },
      authorize: async (credentials): Promise<any> => {
        console.log('🔄 PASO 1: authorize() retorna usuario para jwt()')
        console.log('Authorizando')

        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await AuthService.validateCredentials(
          credentials.username as string,
          credentials.password as string
        )

        console.log('Usuario', user)

        return user
      }
    })
  ]
})
