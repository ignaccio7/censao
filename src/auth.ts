// oxlint-disable no-console
// oxlint-disable no-magic-numbers
// oxlint-disable new-cap
// oxlint-disable id-length
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

export const { handlers, signIn, signOut, auth } = NextAuth({
  pages: {
    signIn: 'auth/ingresar'
  },

  session: {
    strategy: 'jwt',
    maxAge: 60 * 15
  },

  callbacks: {
    jwt: async (user): Promise<any> => {
      console.log('🔄 PASO 2: Ejecutando jwt() callback')
      console.log(user)
      return user
    },
    session: async (user: any): Promise<any> => {
      console.log('🔄 PASO 3: Ejecutando session() callback')
      console.log(user)
      return user
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

        let user = null
        const passwordHashed = credentials.password

        const userData = [
          {
            username: 'admin',
            password: '123'
          },
          {
            username: 'doctor',
            password: '123'
          }
        ]

        user = userData.find(
          u =>
            u.username === credentials.username && u.password === passwordHashed
        )
        console.log(user)

        if (!user) {
          throw new Error('Credenciales incorrectas')
        }

        return user
      }
    })
  ]
})
