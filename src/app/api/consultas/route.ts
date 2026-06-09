// oxlint-disable consistent-type-imports
// oxlint-disable group-exports
// oxlint-disable func-style
// oxlint-disable prefer-default-export
import { consultaCreateSchema } from '@/app/dashboard/consultas/schemas'
import prisma from '@/lib/prisma/prisma'
import AuthService from '@/lib/services/auth-service'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Roles } from '@/app/api/lib/constants'

// LISTAR CONSULTAS DEL DOCTOR
export async function GET() {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas',
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
    // Filtro base: consultas no eliminadas
    const whereClause: any = {
      eliminado_en: null
    }

    // Si es DOCTOR_GENERAL, filtrar solo sus consultas (a través de la ficha → disponibilidad → doctor)
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

    const consultas = await prisma.consultas.findMany({
      where: whereClause,
      orderBy: { creado_en: 'desc' },
      select: {
        id: true,
        motivo_consulta: true,
        observaciones: true,
        requiere_retorno: true,
        creado_en: true,
        ficha_origen: {
          select: {
            id: true,
            orden_turno: true,
            fecha_ficha: true,
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
        },
        citas: {
          where: { eliminado_en: null },
          select: {
            id: true,
            fecha_programada: true,
            tipo: true,
            estado: true,
            observaciones: true
          },
          orderBy: { fecha_programada: 'asc' }
        }
      }
    })

    const consultasDto = consultas.map(c => {
      const persona = c.ficha_origen.pacientes.personas
      const fechaConsulta = new Date(c.creado_en).toLocaleDateString('es-BO', {
        timeZone: 'America/La_Paz',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })

      return {
        id: c.id,
        paciente_nombre:
          `${persona.nombres} ${persona.paterno} ${persona.materno}`.trim(),
        paciente_ci: c.ficha_origen.pacientes.paciente_id,
        motivo_consulta: c.motivo_consulta,
        observaciones: c.observaciones,
        requiere_retorno: c.requiere_retorno,
        fecha_consulta: fechaConsulta,
        especialidad:
          c?.ficha_origen?.disponibilidades?.doctores_especialidades
            ?.especialidades?.nombre,
        ficha_id: c.ficha_origen.id,
        citas: c.citas
      }
    })

    return NextResponse.json({ success: true, data: consultasDto })
  } catch (error) {
    console.error('Error al obtener consultas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor', success: false },
      { status: 500 }
    )
  }
}

// REGISTRAR UNA NUEVA CONSULTA
export async function POST(request: NextRequest): Promise<NextResponse> {
  const validation = await AuthService.validateApiPermission(
    '/api/consultas',
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
    const validationResult = consultaCreateSchema.safeParse(body)
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

    // 1. Buscar la ficha origen con datos del paciente y doctor asignado
    const ficha = await prisma.fichas.findUnique({
      where: { id: validData.fichaOrigenId },
      include: {
        pacientes: {
          include: {
            personas: true
          }
        },
        disponibilidades: {
          select: {
            turno_codigo: true,
            doctores_especialidades: {
              select: {
                doctor_id: true,
                especialidad_id: true
              }
            }
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

    // 2. Crear la consulta
    const consulta = await prisma.consultas.create({
      data: {
        ficha_origen_id: validData.fichaOrigenId,
        motivo_consulta: validData.motivoConsulta,
        observaciones: validData.observaciones || null,
        requiere_retorno: validData.requiereRetorno,
        consulta_padre_id: validData.consultaPadreId || null,
        creado_por: userId
      }
    })

    // 2.1 Absorción automática de citas si es un seguimiento
    // Cuando se crea un nuevo seguimiento se absorben las citas PENDIENTES de:
    //   - La consulta raíz (consultaPadreId)
    //   - Todos los seguimientos hermanos previos (comparten el mismo consulta_padre_id)
    let citasAbsorbidas = 0
    if (validData.consultaPadreId) {
      // Buscar todos los seguimientos hermanos ya existentes
      const hermanos = await prisma.consultas.findMany({
        where: {
          consulta_padre_id: validData.consultaPadreId,
          eliminado_en: null,
          // Excluir el que acabamos de crear
          id: { not: consulta.id }
        },
        select: { id: true }
      })

      // IDs cuyas citas PENDIENTES deben absorberse: raíz + todos los hermanos
      const consultaIdsAAbsorber = [
        validData.consultaPadreId,
        ...hermanos.map(h => h.id)
      ]

      const updateResult = await prisma.citas.updateMany({
        where: {
          consulta_id: { in: consultaIdsAAbsorber },
          estado: 'PENDIENTE',
          eliminado_en: null
        },
        data: {
          estado: 'ABSORBIDA',
          actualizado_por: userId,
          actualizado_en: new Date()
        }
      })
      citasAbsorbidas = updateResult.count
    }

    // 3. Crear cita de retorno si fue solicitada
    let citaCreada = false
    if (validData.cita) {
      const doctorEspecialidad = ficha.disponibilidades?.doctores_especialidades
      const especialidadId = doctorEspecialidad?.especialidad_id
      const pacienteCi = ficha.pacientes.paciente_id
      const turnoAsignado =
        validData.cita.turnoCodigo ?? ficha.disponibilidades?.turno_codigo

      // Si el formulario mandó un doctorId explícito (override), verificar que existe.
      // Si no, usar el doctor de la ficha (comportamiento original).
      let doctorId = validData.cita.doctorId ?? doctorEspecialidad?.doctor_id

      if (validData.cita.doctorId) {
        const doctorExiste = await prisma.doctores.findUnique({
          where: { doctor_id: validData.cita.doctorId }
        })
        if (!doctorExiste) {
          return NextResponse.json(
            {
              success: false,
              message: 'El doctor seleccionado no existe'
            },
            { status: 400 }
          )
        }
        doctorId = doctorExiste.doctor_id
      }

      if (!doctorId || !especialidadId || !turnoAsignado) {
        return NextResponse.json(
          {
            success: false,
            message:
              'No se pudo obtener el doctor, especialidad o turno de la ficha actual'
          },
          { status: 400 }
        )
      }

      await prisma.citas.create({
        data: {
          paciente_id: pacienteCi,
          doctor_id: doctorId,
          consulta_id: consulta.id,
          fecha_programada: new Date(validData.cita.fechaProgramada),
          tipo: validData.cita.tipo,
          turno_codigo: turnoAsignado,
          estado: 'PENDIENTE',
          observaciones: validData.cita.observaciones || null,
          creado_por: userId
        }
      })
      citaCreada = true
    }

    // 4. (Removido: La ficha ya no se marca como ATENDIDA automáticamente)
    // El doctor debe marcarla explícitamente desde la interfaz.

    const persona = ficha.pacientes.personas

    return NextResponse.json(
      {
        success: true,
        message: `Consulta registrada exitosamente — ${validData.motivoConsulta}${citaCreada ? ' · Cita de retorno programada' : ''}${citasAbsorbidas > 0 ? ` · ${citasAbsorbidas} cita(s) absorbida(s)` : ''}`,
        data: {
          consulta_id: consulta.id,
          paciente:
            `${persona.nombres} ${persona.paterno} ${persona.materno || ''}`.trim(),
          motivo: validData.motivoConsulta,
          requiere_retorno: validData.requiereRetorno,
          cita_creada: citaCreada,
          citas_absorbidas: citasAbsorbidas
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating consulta:', error)
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
