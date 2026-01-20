// oxlint-disable no-extraneous-class
import { auth } from '@/auth'
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

      console.log(userWithPermissionsForJWT)
      const d = this.formatUserData(userWithPermissionsForJWT, true)
      console.log(d)

      return d
    } catch (error) {
      console.error('AuthService Error:', error)
      return null
    }
  }

  static async getProfilePermissions(userId: string) {
    try {
      console.log(userId)

      const permissionsForStore = await this.getUserPermissionsForStore(userId)

      console.log(permissionsForStore)

      return this.formatUserData(permissionsForStore)
    } catch (error) {
      console.error('Error al obtener permisos:', error)
      return null
    }
  }

  static async validateApiPermission(route: string, method: string) {
    const session = await auth()
    console.log(
      '-------------------------------------------------------------------SESION PARA VALIDAR API'
    )
    console.log(session)

    if (!session || !session.user.id) {
      return {
        success: false,
        error: 'No se ha iniciado sesion',
        status: 401
      }
    }

    const hasPermission = await this.verifyAPIPermission(
      session.user.id,
      route,
      method
    )

    if (!hasPermission) {
      return {
        success: false,
        error: 'No tienes permisos para realizar esta accion',
        status: 403
      }
    }

    return {
      success: true,
      status: 200,
      data: {
        id: session.user.id,
        username: session.user.username
      }
    }
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
    console.log(userId)

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
                    },
                    NOT: {
                      permisos: {
                        ruta: {
                          contains: '/:uuid'
                        }
                      }
                    }
                  },
                  select: {
                    permisos: {
                      select: {
                        ruta: true,
                        metodos: true,
                        descripcion: true,
                        icono: true,
                        modulo: true,
                        nombre: true
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
          link: rp.permisos.ruta,
          methods: rp.permisos.metodos,
          description: rp.permisos.descripcion,
          icon: rp.permisos.icono,
          module: rp.permisos.modulo,
          label: rp.permisos.nombre
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

  static async verifyAPIPermission(
    userId: string,
    requiredRoute: string,
    requiredMetohd: string
  ): Promise<boolean> {
    try {
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
                    tipo: 'backend',
                    metodos: {
                      has: requiredMetohd.toString() as string
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
    } catch (error) {
      console.log('Error verificando permisos:', error)
      return false
    }
  }
}
