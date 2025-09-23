// ELIMINAR ESTO YA QUE ES UN ENDPOINT DE LA API
// oxlint-disable group-exports
// oxlint-disable no-console
// oxlint-disable prefer-default-export
// oxlint-disable func-style
'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma/prisma'
import { fichaSchema } from '@/app/dashboard/fichas/schemas'
import { z } from 'zod'

interface ActionResult {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]> | Record<string, { errors: string[] }>
}

export async function createFichaAction(
  formData: FormData
): Promise<ActionResult> {
  try {
    // Validación de datos
    const rawData = {
      cedula: formData.get('cedula')?.toString() || '',
      nombre: formData.get('nombre')?.toString() || '',
      especialidad: formData.get('especialidad')?.toString() || '',
      doctor: formData.get('doctor')?.toString() || ''
    }

    const validationResult = fichaSchema.safeParse(rawData)
    if (!validationResult.success) {
      const treeified = z.treeifyError(validationResult.error)
      const errors = treeified.properties || {}
      return { success: false, message: 'Error de validación', errors }
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
          data: { ci: validData.cedula, nombres, paterno, materno }
        })
      }

      paciente = await prisma.pacientes.create({
        data: {
          paciente_id: validData.cedula,
          fecha_nacimiento: null,
          sexo: null,
          grupo_sanguineo: null
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
                fecha_cita: fechaCita, // Solo citas de hoy
                eliminado_en: null // Solo citas activas
              }
            }
          }
        }
      }
    })

    if (!disponibilidad) {
      return {
        success: false,
        message: `No hay disponibilidad para este doctor en el turno ${turno}`
      }
    }

    // Verificar capacidad disponible para HOY
    if (disponibilidad._count.citas >= disponibilidad.cupos) {
      return {
        success: false,
        message: `El doctor ya no tiene cupos disponibles para el turno ${turno} de hoy`
      }
    }

    // Calcular siguiente orden para HOY
    const siguienteOrden = disponibilidad._count.citas + 1

    // Crear la cita
    const nuevaCita = await prisma.citas.create({
      data: {
        paciente_id: validData.cedula,
        disponibilidad_id: disponibilidad.id,
        fecha_cita: fechaCita, // Fecha de hoy
        orden_turno: siguienteOrden, // Orden secuencial para hoy
        creado_por: 'sistema' // Para auditoría
      }
    })

    revalidatePath('/dashboard/fichas')

    return {
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
    }
  } catch (error) {
    console.error('Error creating ficha:', error)

    // Manejo específico de error de constraint único
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return {
        success: false,
        message:
          'Error de concurrencia. Otro paciente tomó este turno. Intente nuevamente.'
      }
    }

    return {
      success: false,
      message: 'Error interno del servidor'
    }
  }
}

// Función auxiliar para obtener citas del día
export async function obtenerCitasDelDia(fecha?: Date) {
  const fechaBuscada = fecha || new Date()
  fechaBuscada.setHours(0, 0, 0, 0)

  return await prisma.citas.findMany({
    where: {
      fecha_cita: fechaBuscada,
      eliminado_en: null
    },
    include: {
      pacientes: {
        include: {
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
        include: {
          turnos_catalogo: {
            select: {
              codigo: true,
              nombre: true,
              hora_inicio: true,
              hora_fin: true
            }
          },
          doctores_especialidades: {
            include: {
              doctores: {
                include: {
                  personas: {
                    select: {
                      nombres: true,
                      paterno: true,
                      materno: true
                    }
                  }
                }
              },
              especialidades: {
                select: {
                  nombre: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: [
      { disponibilidades: { turnos_catalogo: { hora_inicio: 'asc' } } },
      { orden_turno: 'asc' }
    ]
  })
}
