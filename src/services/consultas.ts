import prisma from '@/lib/prisma/prisma'

interface ConsultasParams {
  pacienteCi: string
  search?: string
  page?: number
  numberPerPage?: number
  especialidadId?: string
}

export class ConsultasService {
  static async getConsultasByPaciente({
    pacienteCi,
    search,
    page = 1,
    numberPerPage = 5,
    especialidadId
  }: ConsultasParams) {
    const filters: any = {
      where: {
        eliminado_en: null,
        consulta_padre_id: null, // Solo consultas raíz — los seguimientos se muestran dentro del detalle
        ficha_origen: {
          paciente_id: pacienteCi,
          ...(especialidadId && {
            disponibilidades: {
              doctores_especialidades: {
                especialidad_id: especialidadId
              }
            }
          })
        }
      }
    }

    if (search) {
      filters.where.motivo_consulta = { contains: search, mode: 'insensitive' }
    }

    const consultas = await prisma.consultas.findMany({
      where: filters.where,
      skip: (page - 1) * numberPerPage,
      take: numberPerPage,
      include: {
        ficha_origen: {
          include: {
            disponibilidades: {
              include: {
                doctores_especialidades: {
                  include: {
                    doctores: {
                      include: {
                        personas: true
                      }
                    },
                    especialidades: true
                  }
                }
              }
            }
          }
        },
        citas: {
          where: { eliminado_en: null }
        },
        seguimientos: {
          where: { eliminado_en: null },
          include: {
            citas: {
              where: { eliminado_en: null }
            }
          }
        }
      },
      orderBy: { creado_en: 'desc' }
    })

    return consultas.map(c => {
      const doctorData =
        c.ficha_origen?.disponibilidades?.doctores_especialidades
      const doctorPersona = doctorData?.doctores?.personas

      // Estado calculado dinámicamente:
      // Es ACTIVA si la consulta raíz tiene citas pendientes, o si ALGÚN seguimiento tiene citas pendientes.
      const tieneCitasPendientes = c.citas.some(
        cita => cita.estado === 'PENDIENTE'
      )
      const seguimientosTienenCitasPendientes = c.seguimientos.some(seg =>
        seg.citas.some(cita => cita.estado === 'PENDIENTE')
      )
      const estado_calculado =
        tieneCitasPendientes || seguimientosTienenCitasPendientes
          ? 'ACTIVA'
          : 'CERRADA'

      return {
        id: c.id,
        motivo_consulta: c.motivo_consulta,
        observaciones: c.observaciones,
        requiere_retorno: c.requiere_retorno,
        fecha_consulta: new Date(c.creado_en).toLocaleDateString('es-BO', {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }),
        estado_calculado,
        cantidad_citas: c.citas.length,
        cantidad_seguimientos: c.seguimientos.length,
        consulta_padre_id: c.consulta_padre_id,
        doctor_nombre: doctorPersona
          ? `${doctorPersona.nombres} ${doctorPersona.paterno}`.trim()
          : null,
        especialidad: doctorData?.especialidades?.nombre
      }
    })
  }

  static async countConsultasByPaciente({
    pacienteCi,
    search,
    especialidadId
  }: Omit<ConsultasParams, 'page' | 'numberPerPage'>) {
    const where: any = {
      eliminado_en: null,
      consulta_padre_id: null, // Solo consultas raíz
      ficha_origen: {
        paciente_id: pacienteCi,
        ...(especialidadId && {
          disponibilidades: {
            doctores_especialidades: {
              especialidad_id: especialidadId
            }
          }
        })
      }
    }

    if (search) {
      where.motivo_consulta = { contains: search, mode: 'insensitive' }
    }

    return prisma.consultas.count({ where })
  }

  static async getConsultaDetalle(consultaId: string) {
    const consulta = await prisma.consultas.findUnique({
      where: { id: consultaId, eliminado_en: null },
      include: {
        ficha_origen: {
          include: {
            pacientes: {
              select: {
                paciente_id: true,
                nro_historia_clinica: true,
                fecha_nacimiento: true,
                sexo: true,
                grupo_sanguineo: true,
                personas: true
              }
            },
            disponibilidades: {
              include: {
                doctores_especialidades: {
                  include: {
                    doctores: {
                      include: {
                        personas: true
                      }
                    },
                    especialidades: true
                  }
                }
              }
            }
          }
        },
        citas: {
          where: { eliminado_en: null },
          orderBy: { fecha_programada: 'asc' }
        },
        seguimientos: {
          where: { eliminado_en: null },
          orderBy: { creado_en: 'asc' },
          include: {
            citas: {
              where: { eliminado_en: null },
              orderBy: { fecha_programada: 'asc' }
            }
          }
        },
        consulta_padre: {
          include: {
            citas: {
              where: { eliminado_en: null }
            },
            seguimientos: {
              where: { eliminado_en: null },
              orderBy: { creado_en: 'desc' },
              take: 1
            }
          }
        }
      }
    })

    if (!consulta) return null

    const doctorData =
      consulta.ficha_origen?.disponibilidades?.doctores_especialidades
    const doctorPersona = doctorData?.doctores?.personas
    const pacientePersona = consulta.ficha_origen.pacientes.personas

    // Estado calculado dinámicamente:
    // Es ACTIVA si la consulta raíz tiene citas pendientes, o si ALGÚN seguimiento tiene citas pendientes.
    const tieneCitasPendientes = consulta.citas.some(
      cita => cita.estado === 'PENDIENTE'
    )
    const seguimientosTienenCitasPendientes = consulta.seguimientos.some(seg =>
      seg.citas.some(cita => cita.estado === 'PENDIENTE')
    )
    const estado_calculado =
      tieneCitasPendientes || seguimientosTienenCitasPendientes
        ? 'ACTIVA'
        : 'CERRADA'

    // Determinar si esta consulta (la que estamos viendo en detalle) ha sido absorbida
    let es_absorbida = false
    if (!consulta.consulta_padre_id) {
      // Si es raíz, es absorbida si tiene al menos un seguimiento
      es_absorbida = consulta.seguimientos.length > 0
    } else if (
      consulta.consulta_padre &&
      consulta.consulta_padre.seguimientos.length > 0
    ) {
      // Si es seguimiento, es absorbida si NO es el seguimiento más reciente de su padre
      const ultimoSeguimientoDelPadre = consulta.consulta_padre.seguimientos[0]
      es_absorbida = ultimoSeguimientoDelPadre.id !== consulta.id
    }

    return {
      ...consulta,
      estado_calculado,
      paciente_nombre:
        `${pacientePersona.nombres} ${pacientePersona.paterno} ${pacientePersona.materno || ''}`.trim(),
      paciente_ci: consulta.ficha_origen.paciente_id,
      paciente_fecha_nacimiento:
        consulta.ficha_origen.pacientes.fecha_nacimiento ?? null,
      paciente_nro_historia_clinica:
        consulta.ficha_origen.pacientes.nro_historia_clinica ?? null,
      doctor_nombre: doctorPersona
        ? `${doctorPersona.nombres} ${doctorPersona.paterno}`.trim()
        : null,
      especialidad: doctorData?.especialidades?.nombre,
      fecha_formateada: new Date(consulta.creado_en).toLocaleDateString(
        'es-BO',
        {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        }
      ),
      es_absorbida,
      seguimientos: consulta.seguimientos.map((s, index, array) => ({
        ...s,
        es_absorbida: index < array.length - 1, // Es absorbido si no es el último del array
        estado_calculado: s.citas.some(cita => cita.estado === 'PENDIENTE')
          ? 'ACTIVA'
          : 'CERRADA',
        fecha_formateada: new Date(s.creado_en).toLocaleDateString('es-BO', {
          timeZone: 'America/La_Paz',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      }))
    }
  }
}
