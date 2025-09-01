import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

// Secreto utilizado por NextAuth para firmar y verificar los tokens
const secret = process.env.AUTH_SECRET

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret })
  const { pathname } = req.nextUrl

  console.log('Middleware de Verificacion')
  console.log(token)
  console.log(pathname)

  if (!token && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth/ingresar', req.url))
  }

  // Si todo está bien, deja pasar la solicitud
  return NextResponse.next()
}

// Configuración del matcher para proteger solo las rutas específicas
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'] // No protege rutas de API ni recursos estáticos
}
