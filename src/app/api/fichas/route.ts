import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'

export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/fichas',
    'GET'
  )

  console.log('-----------------------------------------------VALIDATION')
  console.log(validation)

  if (!validation.success) {
    return Response.json(
      {
        error: validation.error,
        success: false
      },
      {
        status: validation.status
      }
    )
  }

  try {
    const fichas = await prisma.citas.findMany()

    return Response.json({
      success: true,
      data: fichas
    })
  } catch (error) {
    console.log('Error al obtener las fichas', error)
    return Response.json(
      { error: 'Error interno del servidor', success: false },
      {
        status: 500
      }
    )
  }
}
