import prisma from '@/lib/prisma/prisma'

export const VacunasService = {
  async getAllVacunas({
    search = '',
    page = 1,
    numberPerPage = 10
  }: {
    search?: string
    page?: number
    numberPerPage?: number
  }) {
    const where = {
      eliminado_en: null,
      ...(search
        ? {
            OR: [
              { nombre: { contains: search, mode: 'insensitive' as const } },
              {
                descripcion: { contains: search, mode: 'insensitive' as const }
              },
              { fabricante: { contains: search, mode: 'insensitive' as const } }
            ]
          }
        : {})
    }

    return prisma.vacunas.findMany({
      where,
      skip: (page - 1) * numberPerPage,
      take: numberPerPage,
      include: {
        esquema_dosis: {
          where: { eliminado_en: null },
          orderBy: { numero: 'asc' }
        }
      },
      orderBy: { creado_en: 'desc' }
    })
  },

  async countVacunas({ search = '' }: { search?: string }) {
    return prisma.vacunas.count({
      where: {
        eliminado_en: null,
        ...(search
          ? {
              OR: [
                { nombre: { contains: search, mode: 'insensitive' as const } },
                {
                  descripcion: {
                    contains: search,
                    mode: 'insensitive' as const
                  }
                },
                {
                  fabricante: { contains: search, mode: 'insensitive' as const }
                }
              ]
            }
          : {})
      }
    })
  },

  async getVacunaById(id: string) {
    return prisma.vacunas.findUnique({
      where: { id, eliminado_en: null },
      include: {
        esquema_dosis: {
          where: { eliminado_en: null },
          orderBy: { numero: 'asc' }
        }
      }
    })
  }
}
