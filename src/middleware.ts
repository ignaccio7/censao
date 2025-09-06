import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Secreto utilizado por NextAuth para firmar y verificar los tokens
const secret = process.env.AUTH_SECRET

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret })
  const { pathname } = req.nextUrl

  console.log('Middleware de Verificacion')
  console.log(token)
  console.log(pathname)

  if (!token) {
    return NextResponse.redirect(new URL('/auth/ingresar', req.url))
  }

  const isPermittedRoute = (token.permisos as string[]).some(route => {
    // Para rutas exactas
    if (pathname === route) {
      return true
    }

    // Para rutas con parámetros uuid
    if (route.includes(':')) {
      const pattern = new RegExp(
        `
        ^${route.replace(
          /:uuid/g,
          '[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'
        )}$
        `,
        'i'
      )
      return pattern.test(pathname)
    }

    return false
  })

  if (!isPermittedRoute) {
    console.log(new URL(pathname, req.url))

    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  console.log('Ruta permitida', isPermittedRoute)

  // Si todo está bien, deja pasar la solicitud
  return NextResponse.next()
}

// Configuración del matcher para proteger solo las rutas específicas
export const config = {
  matcher: ['/dashboard/:path']
}
