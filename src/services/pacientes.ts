import prisma from '@/lib/prisma/prisma'

interface PacientesParams {
  search?: string
  page?: number
  numberPerPage?: number
}

export class PacientesService {
  static async getAllPacientes({
    search,
    page = 1,
    numberPerPage = 5
  }: PacientesParams) {
    const filters: any = {
      where: {
        eliminado_en: null
        // fichas: { some: { eliminado_en: null } } // solo registrados con fichas
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
    search
  }: Omit<PacientesParams, 'page' | 'numberPerPage'>) {
    const where: any = {
      eliminado_en: null,
      fichas: { some: { eliminado_en: null } }
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
