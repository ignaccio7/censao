// app/lib/services/fichaService.ts
import prisma from '@/lib/prisma/prisma'
import { Roles } from '../lib/constants'

export class FichasService {
  /**
   * Obtiene TODAS las fichas del turno (para ADMINISTRADOR o DOCTOR_FICHAS)
   */
  static async getAllFichasByTurn({
    inicioUTC,
    finUTC,
    turno
  }: {
    inicioUTC: Date
    finUTC: Date
    turno: string
  }) {
    const fichas = await prisma.fichas.findMany({
      where: {
        fecha_ficha: {
          gte: inicioUTC,
          lte: finUTC
        },
        disponibilidades: {
          turno_codigo: turno
        },
        eliminado_en: null
      },
      orderBy: [{ fecha_ficha: 'asc' }, { orden_turno: 'asc' }],
      select: this.getFichaSelect()
    })
    return fichas
  }

  /**
   * Obtiene fichas SOLO del doctor específico (para DOCTOR_GENERAL)
   */
  static async getFichasByTurnAndDoctor({
    inicioUTC,
    finUTC,
    turno,
    userId
  }: {
    inicioUTC: Date
    finUTC: Date
    turno: string
    userId: string
  }) {
    const fichas = await prisma.fichas.findMany({
      where: {
        fecha_ficha: {
          gte: inicioUTC,
          lte: finUTC
        },
        disponibilidades: {
          turno_codigo: turno,
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
        },
        eliminado_en: null
      },
      orderBy: [{ fecha_ficha: 'asc' }, { orden_turno: 'asc' }],
      select: this.getFichaSelect()
    })
    return fichas
  }

  /**
   * Método principal que decide cuál función usar según el rol
   */
  static async getFichas({
    inicioUTC,
    finUTC,
    turno,
    userId,
    userRole
  }: {
    inicioUTC: Date
    finUTC: Date
    turno: string
    userId: string
    userRole: string
  }) {
    // Si es ADMINISTRADOR o DOCTOR_FICHAS, obtiene todas las fichas
    if (userRole === Roles.ADMINISTRADOR || userRole === Roles.DOCTOR_FICHAS) {
      return await this.getAllFichasByTurn({ inicioUTC, finUTC, turno })
    }

    // Si es DOCTOR_GENERAL, obtiene solo sus fichas
    if (userRole === Roles.DOCTOR_GENERAL) {
      return await this.getFichasByTurnAndDoctor({
        inicioUTC,
        finUTC,
        turno,
        userId: userId
      })
    }

    // Si es otro rol, puedes manejarlo según  en caso fuera PACIENTE
    throw new Error('Rol no autorizado para ver fichas')
  }

  /**
   * Helper para la selección común
   */
  private static getFichaSelect() {
    return {
      id: true,
      orden_turno: true,
      fecha_ficha: true,
      estado: true,
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
          doctores_especialidades: {
            include: {
              doctores: {
                select: {
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
    }
  }
}
