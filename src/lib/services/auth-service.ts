// oxlint-disable no-extraneous-class
import prisma from '../prisma/prisma'
import bcrypt from 'bcryptjs'

export default class AuthService {
  /**
   ******************** Metodos principales utilizados ********************
   * */
  static async validateCredentials(username: string, password: string) {
    try {
      // 1. Primero solo verificar usuario y contraseña
      const user = await prisma.usuarios.findUnique({
        where: {
          username,
          activo: true
        },
        select: {
          usuario_id: true,
          password_hash: true
        }
      })

      if (!user) {
        return null
      }

      const isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) {
        return null
      }

      // 2. Si la contraseña es válida, obtener roles y permisos
      const userWithPermissionsForJWT = await this.getUserPermissionsForJWT(
        user.usuario_id
      )

      return this.formatUserData(userWithPermissionsForJWT, true)
    } catch (error) {
      console.error('AuthService Error:', error)
      return null
    }
  }

  static async getProfilePermissions(userId: string) {
    try {
      const permissionsForStore = await this.getUserPermissionsForStore(userId)

      return this.formatUserData(permissionsForStore)
    } catch (error) {
      console.error('Error al obtener permisos:', error)
      return null
    }
  }

  static async verifyAPIPermission(
    userId: string,
    requiredRoute: string,
    requiredMethod: string
  ): Promise<boolean> {
    const permission = await prisma.usuarios_roles.findFirst({
      where: {
        usuario_id: userId,
        hasta: null
      },
      orderBy: { desde: 'desc' },
      select: {
        roles: {
          select: {
            roles_permisos: {
              where: {
                permisos: {
                  ruta: requiredRoute,
                  tipo: 'backend', // ✅ Para APIs usamos backend
                  metodos: {
                    has: requiredMethod.toLowerCase()
                  }
                }
              },
              select: {
                permisos: {
                  select: {
                    ruta: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return !!permission?.roles?.roles_permisos?.length
  }

  /**
   ******************** Metodos secundarios ********************
   * */

  private static async getUserPermissionsForJWT(userId: string) {
    return prisma.usuarios.findUnique({
      where: { usuario_id: userId },
      select: {
        usuario_id: true,
        username: true,
        personas: {
          select: {
            nombres: true,
            paterno: true,
            materno: true
          }
        },
        usuarios_roles: {
          where: { hasta: null },
          orderBy: { desde: 'desc' },
          take: 1,
          select: {
            roles: {
              select: {
                nombre: true,
                descripcion: true,
                roles_permisos: {
                  where: {
                    permisos: {
                      tipo: 'frontend'
                    }
                  },
                  select: {
                    permisos: {
                      select: {
                        ruta: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  private static async getUserPermissionsForStore(userId: string) {
    return prisma.usuarios.findUnique({
      where: { usuario_id: userId },
      select: {
        usuarios_roles: {
          where: { hasta: null },
          orderBy: { desde: 'desc' },
          take: 1,
          select: {
            roles: {
              select: {
                roles_permisos: {
                  where: {
                    permisos: {
                      tipo: 'frontend'
                    }
                  },
                  select: {
                    permisos: {
                      select: {
                        ruta: true,
                        metodos: true,
                        descripcion: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  private static formatUserData(user: any, isJWT = false) {
    // oxlint-disable-next-line no-magic-numbers
    const primaryRole = user.usuarios_roles[0]?.roles
    let permisos = []
    if (isJWT) {
      permisos =
        primaryRole?.roles_permisos.map((rp: any) => rp.permisos.ruta) || []
    } else {
      permisos =
        primaryRole?.roles_permisos.map((rp: any) => ({
          ruta: rp.permisos.ruta,
          metodos: rp.permisos.metodos
        })) || []
    }

    return {
      id: user.usuario_id,
      username: user.username,
      name: `${user?.personas?.nombres} ${user?.personas?.paterno} ${user?.personas?.materno}`,
      role: primaryRole?.nombre || '',
      roleDescription: primaryRole?.descripcion || '',
      permisos
    }
  }
}
