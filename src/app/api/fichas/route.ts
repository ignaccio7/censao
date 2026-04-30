// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import {
  fichaRegisterSchema,
  fichaUpdateSchema
} from '@/app/dashboard/fichas/schemas' // TODO: ver como generalizar los esquemas o separarlos entre 2 uno front otro back
import { RECORD_TYPES } from '@/app/api/lib/constants'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { FichasService } from './service'
import { getRangoUTCBoliviaHoy, getTurnoActual } from '@/app/utils/date'

// LISTAR LAS FICHAS
export async function GET() {
  // IMPORTANTE: DE ESTA FORMA SE ESTA VALIDANDO LOS PERMISOS QUE EL USUARIO TIENE PARA REALIZAR ACCIONES EN ESTE RECURSO
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

  // Obtenemos la ficha segun el ID del doctor y hacemos la consulta segun el rol que tenga
  const idUser = validation.data?.id
  const rolUser = validation.data?.role

  const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()
  const turno = await getTurnoActual()

  console.log(`EL TURNO ES:${turno}`)

  try {
    const fichas = await FichasService.getFichas({
      inicioUTC,
      finUTC,
      turno,
      userId: idUser as string,
      userRole: rolUser as string
    })

    const data = fichas.map(ficha => ({
      fecha_ficha: ficha.fecha_ficha
    }))
    console.log('Fichas db')
    console.log(data)

    // console.log(fichas)

    const fichasDto = fichas.map(ficha => {
      const fechaFicha = new Date(ficha.fecha_ficha).toLocaleString('es-BO', {
        timeZone: 'America/La_Paz',
        hour12: false
      })

      const [fechaBoliviana, horaBoliviana] = fechaFicha.split(', ')

      const especialidad =
        ficha?.disponibilidades?.doctores_especialidades.especialidades
          .nombre ?? ''

      const personaDoctor =
        ficha?.disponibilidades?.doctores_especialidades?.doctores?.personas
      let nombreDoctor = personaDoctor
        ? `${personaDoctor.nombres ?? ''} ${personaDoctor.paterno ?? ''} ${personaDoctor.materno ?? ''}`
        : ''

      return {
        ficha_id: ficha.id,
        orden_turno: ficha.orden_turno,
        fecha_ficha: fechaBoliviana,
        hora_ficha: horaBoliviana,
        estado: ficha.estado,
        paciente_id: ficha.pacientes.paciente_id,
        paciente_nombres: `${ficha.pacientes.personas.nombres} ${ficha.pacientes.personas.paterno} ${ficha.pacientes.personas.materno}`,
        turno_codigo: ficha?.disponibilidades?.turno_codigo ?? '',
        doctor_id: ficha?.disponibilidades?.doctor_especialidad_id ?? '',
        doctor_nombre: nombreDoctor,
        especialidad_id:
          ficha?.disponibilidades?.doctores_especialidades.especialidad_id ??
          '',
        especialidad_nombre: especialidad
      }
    })

    console.log(fichasDto)

    return NextResponse.json({ success: true, data: fichasDto })
  } catch (error) {
    console.log('Error al obtener las fichas', error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Error desconocido al obtener las fichas'

    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    )
  }
}

// REGISTRAR UNA NUEVA FICHA
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

    console.log(`El body es:`, body)

    // Validación de datos
    const validationResult = fichaRegisterSchema.safeParse(body)
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

    console.log(`El body es:`, validData)

    // Crear/verificar persona
    let persona = await prisma.personas.findUnique({
      where: { ci: validData.cedula }
    })

    const formatedName = validData.nombre
      .trim()
      .split(' ')
      .map(
        (word: string) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(' ')

    if (persona) {
      // Validacion para verificar que los datos de la persona sean los mismos del formulario
      const nombrePersona =
        `${persona?.nombres} ${persona?.paterno} ${persona?.materno}`.trim()
      console.log(nombrePersona)
      console.log(formatedName)

      if (nombrePersona !== formatedName) {
        return NextResponse.json({
          success: false,
          message: 'Los datos de la persona no coinciden con los del formulario'
        })
      }
    } else {
      const nombreParts = formatedName.split(' ')
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

    // Crear/verificar paciente
    let paciente = await prisma.pacientes.findUnique({
      where: { paciente_id: validData.cedula }
    })

    if (!paciente) {
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

    const fechaFicha = new Date()

    const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()
    const turno = await getTurnoActual()

    // Obtenemos el nro total de fichas en este turno para este dia
    const totalFichas = await prisma.fichas.count({
      where: {
        fecha_ficha: {
          gte: inicioUTC,
          lte: finUTC
        }
      }
    })

    // Calcular siguiente orden para HOY
    const siguienteOrden = totalFichas + 1

    // Crear la ficha
    const nuevaFicha = await prisma.fichas.create({
      data: {
        paciente_id: validData.cedula,
        fecha_ficha: fechaFicha,
        orden_turno: siguienteOrden,
        estado: RECORD_TYPES.ADMISION,
        turno_codigo: turno,
        creado_por: id
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: `Ficha creada exitosamente. ${fechaFicha.toLocaleDateString('es-BO')} - Turno ${turno} #${siguienteOrden}`,
        data: {
          ficha_id: nuevaFicha.id,
          paciente: paciente.paciente_id,
          fecha: fechaFicha.toISOString().split('T')[0],
          turno: turno,
          orden: siguienteOrden
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

// ACTUALIZAR EL ESTADO DE UNA FICHA
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // Validar permisos
    const validation = await AuthService.validateApiPermission(
      '/api/fichas',
      'PATCH'
    )

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error, success: false },
        { status: validation.status }
      )
    }

    const userId = validation.data?.id
    console.log(userId)

    const body = await request.json()

    console.log(body)

    const validationResult = fichaUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      console.log(validationResult.error)

      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      console.log(errors)

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

    const ficha = await prisma.fichas.findUnique({
      where: {
        id: validData.id
      }
    })

    if (!ficha) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ficha no encontrada'
        },
        {
          status: 404
        }
      )
    }

    // Datos a actualizar
    const updateData: any = {
      estado: validData.status
    }

    // Si se envía especialidad y doctor, buscar la nueva disponibilidad para reasignar
    if (validData.especialidad && validData.doctor) {
      const { inicioUTC, finUTC } = getRangoUTCBoliviaHoy()
      const turno = await getTurnoActual()

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
              fichas: {
                where: {
                  fecha_ficha: {
                    gte: inicioUTC,
                    lte: finUTC
                  },
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

      updateData.disponibilidad_id = disponibilidad.id
      updateData.orden_turno = disponibilidad._count.fichas + 1
    }

    const fichaActualizada = await prisma.fichas.update({
      where: {
        id: validData.id
      },
      data: updateData
    })

    console.log(fichaActualizada)

    return NextResponse.json(
      {
        success: true,
        message: validData.especialidad
          ? 'Ficha reasignada exitosamente'
          : 'Ficha actualizada exitosamente'
      },
      {
        status: 200
      }
    )
  } catch (error) {
    console.error('Error updating ficha:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error al actualizar la ficha'
      },
      {
        status: 500
      }
    )
  }
}
