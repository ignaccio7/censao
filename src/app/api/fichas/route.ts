// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/fichas',
    'GET'
  )

  console.log('-----------------------------------------------VALIDATION')
  console.log(validation)

  if (!validation.success) {
    // return Response.json(
    //   {
    //     error: validation.error,
    //     success: false
    //   },
    //   {
    //     status: validation.status
    //   }
    // )
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  try {
    const fichas = await prisma.citas.findMany()

    return NextResponse.json({ success: true, data: fichas })

    // return Response.json({
    //   success: true,
    //   data: fichas
    // })
  } catch (error) {
    console.log('Error al obtener las fichas', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
    // return Response.json(
    //   { error: 'Error interno del servidor', success: false },
    //   {
    //     status: 500
    //   }
    // )
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  console.log('-----------------------------------------------BODY')
  console.log(body)
}
