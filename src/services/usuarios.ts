import prisma from '@/lib/prisma/prisma'

/**
   *  {
      usuario_id: 'c0ce6b09-a53c-4d5b-a879-3387e1a2b3ad',
      persona_ci: '12345678',
      username: 'paciente1',
      password_hash: '$2b$12$zHTyMP.P0HEb.BivNh.mYOqaF/A9ejtPrpaq1VnF457CHmNKyAPT6',
      activo: true,
      creado_en: new Date('2026-04-26T22:45:57.000Z'),
      creado_por: null,
      actualizado_en: new Date('2026-04-26T22:45:57.000Z'),
      actualizado_por: null,
      eliminado_en: null,
      eliminado_por: null,
      usuarios_roles: [ { roles: { nombre: 'PACIENTE' } } ],
      personas: { nombres: 'Ana Sofía', paterno: 'Rojas', materno: 'Torres' }
    },
   */

interface UsersResponse {
  usuario_id: string
  persona_ci: string
  username: string
  password_hash: string
  activo: boolean
  creado_en: Date
  creado_por: string | null
  actualizado_en: Date
  actualizado_por: string | null
  eliminado_en: Date | null
  eliminado_por: string | null
  usuarios_roles: { roles: { nombre: string } }[]
  personas: { nombres: string; paterno: string; materno: string }
}

export class UserssService {
  static async getAllUsers({
    search,
    page,
    numberPerPage = 10
  }: {
    numberPerPage: number
    search?: string
    page?: number
  }): Promise<UsersResponse[] | null> {
    // TODO: ver como crear una interfaz para estos filtros
    const filters: any = {}

    if (search) {
      filters.where = {
        OR: [
          {
            personas: {
              OR: [
                {
                  nombres: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  materno: {
                    contains: search,
                    mode: 'insensitive'
                  }
                },
                {
                  paterno: {
                    contains: search,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          },
          {
            username: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }
    }

    if (page) {
      filters.skip = (page - 1) * numberPerPage
    }

    const usuarios = await prisma.usuarios.findMany({
      include: {
        usuarios_roles: {
          select: {
            roles: {
              select: {
                nombre: true
              }
            }
          }
        },
        personas: {
          select: {
            nombres: true,
            paterno: true,
            materno: true
          }
        }
      },
      where: filters.where,
      skip: filters.skip,
      take: numberPerPage
    })

    return usuarios as UsersResponse[]
  }

  static async countUsers({ search }: { search?: string }) {
    const where: any = {}

    if (search) {
      where.OR = [
        {
          personas: {
            OR: [
              {
                nombres: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                materno: {
                  contains: search,
                  mode: 'insensitive'
                }
              },
              {
                paterno: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            ]
          }
        },
        {
          username: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }
    const totalUsers = await prisma.usuarios.count({
      where
    })
    return totalUsers
  }
}
