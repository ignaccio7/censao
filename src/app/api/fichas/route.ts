// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { fichaSchema } from '@/app/dashboard/fichas/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Validar permisos usando tu método existente
  const validation = await AuthService.validateApiPermission(
    '/api/fichas',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      {
        error: validation.error,
        success: false
      },
      { status: validation.status }
    )
  }

  const { id = '' } = validation.data || {}

  try {
    // Obtener datos del request
    const body = await request.json()

    // Validación de datos
    const validationResult = fichaSchema.safeParse(body)
    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      return NextResponse.json(
        {
          success: false,
          message: 'Error de validación',
          errors
        },
        { status: 400 }
      )
    }

    const validData = validationResult.data

    // Crear/verificar paciente
    let paciente = await prisma.pacientes.findUnique({
      where: { paciente_id: validData.cedula }
    })

    if (!paciente) {
      let persona = await prisma.personas.findUnique({
        where: { ci: validData.cedula }
      })

      if (!persona) {
        const nombreParts = validData.nombre.trim().split(' ')
        const [nombres = '', paterno = '', materno = ''] = nombreParts

        persona = await prisma.personas.create({
          data: {
            ci: validData.cedula,
            nombres,
            paterno,
            materno,
            creado_por: id
          }
        })
      }

      paciente = await prisma.pacientes.create({
        data: {
          paciente_id: validData.cedula,
          fecha_nacimiento: null,
          sexo: null,
          grupo_sanguineo: null,
          creado_por: id
        }
      })
    }

    // Determinar turno actual
    const hour = parseInt(
      new Date().toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        hour: 'numeric',
        hour12: false
      })
    )
    const turno = hour < 13 ? 'AM' : 'PM'

    // Fecha de hoy para la cita (sin hora)
    const fechaCita = new Date()
    fechaCita.setHours(0, 0, 0, 0)

    // Buscar disponibilidad del doctor para el turno actual
    const disponibilidad = await prisma.disponibilidades.findFirst({
      where: {
        doctores_especialidades: {
          doctor_id: validData.doctor,
          especialidad_id: validData.especialidad
        },
        turnos_catalogo: {
          codigo: turno
        }
      },
      include: {
        _count: {
          select: {
            citas: {
              where: {
                fecha_cita: fechaCita,
                eliminado_en: null
              }
            }
          }
        }
      }
    })

    if (!disponibilidad) {
      return NextResponse.json(
        {
          success: false,
          message: `No hay disponibilidad para este doctor en el turno ${turno}`
        },
        { status: 400 }
      )
    }

    // Verificar capacidad disponible para HOY
    if (disponibilidad._count.citas >= disponibilidad.cupos) {
      return NextResponse.json(
        {
          success: false,
          message: `El doctor ya no tiene cupos disponibles para el turno ${turno} de hoy`
        },
        { status: 400 }
      )
    }

    // Calcular siguiente orden para HOY
    const siguienteOrden = disponibilidad._count.citas + 1

    // Crear la cita
    const nuevaCita = await prisma.citas.create({
      data: {
        paciente_id: validData.cedula,
        disponibilidad_id: disponibilidad.id,
        fecha_cita: fechaCita,
        orden_turno: siguienteOrden,
        creado_por: id
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: `Ficha creada exitosamente. ${fechaCita.toLocaleDateString('es-BO')} - Turno ${turno} #${siguienteOrden}`,
        data: {
          cita_id: nuevaCita.id,
          paciente: paciente.paciente_id,
          fecha: fechaCita.toISOString().split('T')[0],
          turno: turno,
          orden: siguienteOrden,
          disponibilidad_id: disponibilidad.id
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating ficha:', error)

    // Manejo específico de error de constraint único
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Error de concurrencia. Otro paciente tomó este turno. Intente nuevamente.'
        },
        { status: 409 }
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del servidor'
      },
      { status: 500 }
    )
  }
}
