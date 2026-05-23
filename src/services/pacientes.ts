import prisma from '@/lib/prisma/prisma'
import { Roles } from '@/app/api/lib/constants'

interface PacientesParams {
  search?: string
  page?: number
  numberPerPage?: number
  userId?: string
  userRole?: string
}

export class PacientesService {
  private static async getDoctorCi(userId?: string) {
    if (!userId) return null
    const user = await prisma.usuarios.findUnique({
      where: { usuario_id: userId },
      select: { persona_ci: true }
    })
    return user?.persona_ci ?? null
  }

  static async getAllPacientes({
    search,
    page = 1,
    numberPerPage = 5,
    userId,
    userRole
  }: PacientesParams) {
    const filters: any = {
      where: {
        eliminado_en: null
        // fichas: { some: { eliminado_en: null } } // solo registrados con fichas
      }
    }

    // Si es DOCTOR_GENERAL, filtrar solo sus pacientes
    if (userRole === Roles.DOCTOR_GENERAL && userId) {
      const doctorCi = await this.getDoctorCi(userId)
      if (doctorCi) {
        filters.where.fichas = {
          some: {
            eliminado_en: null,
            disponibilidades: {
              doctores_especialidades: {
                doctor_id: doctorCi
              }
            }
          }
        }
      } else {
        filters.where.fichas = {
          none: {}
        }
      }
    }

    if (search) {
      filters.where.OR = [
        {
          personas: {
            OR: [
              { nombres: { contains: search, mode: 'insensitive' } },
              { materno: { contains: search, mode: 'insensitive' } },
              { paterno: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          paciente_id: { contains: search, mode: 'insensitive' }
        }
      ]
    }

    const pacientes = await prisma.pacientes.findMany({
      where: filters.where,
      skip: (page - 1) * numberPerPage,
      take: numberPerPage,
      include: {
        personas: true,
        _count: {
          select: { fichas: { where: { eliminado_en: null } } }
        }
      },
      orderBy: { personas: { paterno: 'asc' } }
    })

    return pacientes
  }

  static async countPacientes({
    search,
    userId,
    userRole
  }: Omit<PacientesParams, 'page' | 'numberPerPage'>) {
    const where: any = {
      eliminado_en: null
      // fichas: { some: { eliminado_en: null } } // solo registrados con fichas
    }

    // Si es DOCTOR_GENERAL, filtrar solo sus pacientes
    if (userRole === Roles.DOCTOR_GENERAL && userId) {
      const doctorCi = await this.getDoctorCi(userId)
      if (doctorCi) {
        where.fichas = {
          some: {
            eliminado_en: null,
            disponibilidades: {
              doctores_especialidades: {
                doctor_id: doctorCi
              }
            }
          }
        }
      } else {
        where.fichas = {
          none: {}
        }
      }
    }

    if (search) {
      where.OR = [
        {
          personas: {
            OR: [
              { nombres: { contains: search, mode: 'insensitive' } },
              { materno: { contains: search, mode: 'insensitive' } },
              { paterno: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          paciente_id: { contains: search, mode: 'insensitive' }
        }
      ]
    }

    return prisma.pacientes.count({ where })
  }
}
