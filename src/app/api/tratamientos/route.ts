// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { tratamientoCreateSchema } from '@/app/dashboard/tratamientos/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { Roles } from '@/app/api/lib/constants'

// LISTAR TRATAMIENTOS DEL DOCTOR
export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos',
    'GET'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const userId = validation.data?.id
  const userRole = validation.data?.role

  try {
    // Filtro base: tratamientos no eliminados
    const whereClause: any = {
      eliminado_en: null
    }

    // Si es DOCTOR_GENERAL, filtrar solo sus tratamientos (a través de la ficha)
    if (userRole === Roles.DOCTOR_GENERAL) {
      whereClause.ficha_origen = {
        disponibilidades: {
          doctores_especialidades: {
            doctores: {
              personas: {
                usuarios: {
                  some: {
                    usuario_id: userId
                  }
                }
              }
            }
          }
        }
      }
    }

    const tratamientos = await prisma.tratamientos.findMany({
      where: whereClause,
      orderBy: { creado_en: 'desc' },
      select: {
        id: true,
        estado: true,
        dosis_numero: true,
        fecha_aplicacion: true,
        creado_en: true,
        esquema_dosis: {
          select: {
            numero: true,
            notas: true,
            vacunas: {
              select: {
                nombre: true,
                fabricante: true
              }
            }
          }
        },
        ficha_origen: {
          select: {
            id: true,
            orden_turno: true,
            pacientes: {
              select: {
                paciente_id: true,
                personas: {
                  select: {
                    nombres: true,
                    paterno: true,
                    materno: true
                  }
                }
              }
            },
            disponibilidades: {
              select: {
                doctores_especialidades: {
                  select: {
                    especialidades: {
                      select: { nombre: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    const tratamientosDto = tratamientos.map(t => {
      const persona = t.ficha_origen.pacientes.personas
      const fechaAplicacion = new Date(t.fecha_aplicacion).toLocaleDateString(
        'es-BO',
        {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      )

      return {
        id: t.id,
        paciente_nombre:
          `${persona.nombres} ${persona.paterno} ${persona.materno}`.trim(),
        paciente_ci: t.ficha_origen.pacientes.paciente_id,
        vacuna_nombre: t.esquema_dosis.vacunas.nombre,
        vacuna_fabricante: t.esquema_dosis.vacunas.fabricante,
        dosis_numero: t.dosis_numero,
        dosis_notas: t.esquema_dosis.notas,
        estado: t.estado,
        fecha_aplicacion: fechaAplicacion,
        especialidad:
          t.ficha_origen.disponibilidades.doctores_especialidades.especialidades
            .nombre,
        ficha_id: t.ficha_origen.id
      }
    })

    return NextResponse.json({ success: true, data: tratamientosDto })
  } catch (error) {
    console.error('Error al obtener tratamientos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// REGISTRAR UN NUEVO TRATAMIENTO
export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/tratamientos',
    'POST'
  )

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error, success: false },
      { status: validation.status }
    )
  }

  const { id: userId = '' } = validation.data || {}

  try {
    const body = await request.json()

    // Validar datos de entrada
    const validationResult = tratamientoCreateSchema.safeParse(body)
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

    // 1. Buscar la ficha origen con datos del paciente
    const ficha = await prisma.fichas.findUnique({
      where: { id: validData.fichaOrigenId },
      include: {
        pacientes: {
          include: {
            personas: true
          }
        }
      }
    })

    if (!ficha) {
      return NextResponse.json(
        { success: false, message: 'Ficha no encontrada' },
        { status: 404 }
      )
    }

    // 2. Verificar que el esquema de dosis existe
    const esquemaDosis = await prisma.esquema_dosis.findUnique({
      where: { id: validData.esquemaId },
      include: {
        vacunas: { select: { nombre: true } }
      }
    })

    if (!esquemaDosis) {
      return NextResponse.json(
        { success: false, message: 'Esquema de dosis no encontrado' },
        { status: 404 }
      )
    }

    // 3. Verificar/crear usuario del paciente si no existe
    const pacienteCi = ficha.pacientes.paciente_id
    const persona = ficha.pacientes.personas

    const usuarioExistente = await prisma.usuarios.findFirst({
      where: { persona_ci: pacienteCi }
    })

    if (!usuarioExistente) {
      console.log(`Creando usuario para paciente CI: ${pacienteCi}`)

      // Hash del CI como contraseña
      const passwordHash = await bcrypt.hash(pacienteCi, 10)

      // Buscar el rol PACIENTE
      const rolPaciente = await prisma.roles.findUnique({
        where: { nombre: 'PACIENTE' }
      })

      if (!rolPaciente) {
        return NextResponse.json(
          {
            success: false,
            message: 'Rol PACIENTE no encontrado en el sistema'
          },
          { status: 500 }
        )
      }

      // Crear usuario con CI como username y password
      const nuevoUsuario = await prisma.usuarios.create({
        data: {
          persona_ci: pacienteCi,
          username: pacienteCi,
          password_hash: passwordHash,
          activo: true,
          creado_por: userId
        }
      })

      // Asignar rol PACIENTE
      await prisma.usuarios_roles.create({
        data: {
          usuario_id: nuevoUsuario.usuario_id,
          rol_id: rolPaciente.id,
          desde: new Date()
        }
      })

      console.log(
        `Usuario creado: ${pacienteCi} para ${persona.nombres} ${persona.paterno}`
      )
    }

    // 4. Crear el tratamiento
    const tratamiento = await prisma.tratamientos.create({
      data: {
        ficha_origen_id: validData.fichaOrigenId,
        esquema_id: validData.esquemaId,
        dosis_numero: validData.dosisNumero,
        estado: 'EN_CURSO',
        fecha_aplicacion: new Date(),
        creado_por: userId
      }
    })

    // 5. Marcar la ficha como ATENDIDA
    await prisma.fichas.update({
      where: { id: validData.fichaOrigenId },
      data: {
        estado: 'ATENDIDA',
        actualizado_por: userId
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: `Tratamiento registrado exitosamente — ${esquemaDosis.vacunas.nombre} (Dosis ${validData.dosisNumero})`,
        data: {
          tratamiento_id: tratamiento.id,
          paciente: `${persona.nombres} ${persona.paterno} ${persona.materno}`,
          vacuna: esquemaDosis.vacunas.nombre,
          dosis: validData.dosisNumero,
          usuario_creado: !usuarioExistente
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating tratamiento:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
