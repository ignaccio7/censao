import prisma from '@/lib/prisma/prisma'
import type { DoctorListItem } from '@/app/dashboard/admin/doctores/interfaces'
import { Role } from '@/app/api/lib/constants'

interface DoctoresFilters {
  search?: string
  page?: number
  numberPerPage: number
  estado?: string // 'completo' | 'incompleto' | ''
  especialidad?: string // nombre de la especialidad
}

/**
 * Construye el where clause base para doctores:
 * - Solo doctores con rol DOCTOR_GENERAL (via personas → usuarios → usuarios_roles)
 * - Filtro de búsqueda por nombre o CI
 * - Filtro por especialidad
 * - Filtro por estado de configuración (completo/incompleto)
 */
function buildWhereClause({
  search,
  estado,
  especialidad
}: {
  search?: string
  estado?: string
  especialidad?: string
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    eliminado_en: null,
    personas: {
      usuarios: {
        some: {
          eliminado_en: null,
          usuarios_roles: {
            some: {
              eliminado_en: null,
              roles: {
                OR: [
                  { nombre: Role.DOCTOR_GENERAL }
                  // { nombre: Role.ENFERMERIA }, Quiza a futuro cuando se gestione disponibilidad de estos roles
                  // { nombre: Role.DOCTOR_FICHAS } Sino separar en tablas diferentes estas personas con esos roles
                ]
              }
            }
          }
        }
      }
    }
  }

  // Filtro de búsqueda por nombre o CI
  if (search) {
    where.personas = {
      ...where.personas,
      OR: [
        { nombres: { contains: search, mode: 'insensitive' } },
        { paterno: { contains: search, mode: 'insensitive' } },
        { materno: { contains: search, mode: 'insensitive' } },
        { ci: { contains: search, mode: 'insensitive' } }
      ]
    }
  }

  // Filtro por especialidad
  if (especialidad) {
    where.doctores_especialidades = {
      ...where.doctores_especialidades,
      some: {
        especialidades: {
          nombre: {
            contains: especialidad,
            mode: 'insensitive'
          }
        }
      }
      // some: { especialidad_id: especialidadId }
    }
  }

  // Filtro por estado de configuración
  if (estado === 'completo') {
    where.doctores_especialidades = {
      ...where.doctores_especialidades,
      some: {}
    }
  } else if (estado === 'incompleto') {
    where.doctores_especialidades = {
      ...where.doctores_especialidades,
      none: {}
    }
  }

  return where
}

export class DoctoresService {
  /**
   * Obtiene todos los doctores con rol DOCTOR_GENERAL, con sus especialidades y disponibilidades.
   * Soporta búsqueda, filtro por estado de configuración y filtro por especialidad.
   */
  static async getAllDoctores({
    search,
    page = 1,
    numberPerPage = 10,
    estado,
    especialidad
  }: DoctoresFilters): Promise<DoctorListItem[]> {
    const where = buildWhereClause({ search, estado, especialidad })

    const doctores = await prisma.doctores.findMany({
      where,
      include: {
        personas: {
          select: {
            ci: true,
            nombres: true,
            paterno: true,
            materno: true
          }
        },
        doctores_especialidades: {
          where: {
            disponibilidades: {
              some: {
                estado: true,
                eliminado_en: null
              }
            }
          },
          include: {
            especialidades: {
              select: { id: true, nombre: true, estado: true }
            },
            disponibilidades: {
              select: {
                id: true,
                turno_codigo: true,
                cupos: true,
                estado: true
              }
            }
          }
        }
      },
      skip: (page - 1) * numberPerPage,
      take: numberPerPage,
      orderBy: { personas: { nombres: 'asc' } }
    })

    return doctores as DoctorListItem[]
  }

  /**
   * Cuenta el total de doctores con rol DOCTOR_GENERAL que coinciden con los filtros.
   */
  static async countDoctores({
    search,
    estado,
    especialidad
  }: {
    search?: string
    estado?: string
    especialidad?: string
  }): Promise<number> {
    const where = buildWhereClause({ search, estado, especialidad })

    return prisma.doctores.count({ where })
  }

  /**
   * Obtiene solo las especialidades activas (estado: true) para uso en filtros y selects.
   * Las especialidades inactivas no se muestran para nuevas asignaciones.
   */
  static async getEspecialidadesActivas(): Promise<
    { id: string; nombre: string }[]
  > {
    return prisma.especialidades.findMany({
      where: { eliminado_en: null, estado: true },
      select: { id: true, nombre: true },
      orderBy: { nombre: 'asc' }
    })
  }
}
