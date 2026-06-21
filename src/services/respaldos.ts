// src/services/respaldos.ts
// Servicio de SERVIDOR — acceso directo a Prisma (solo para Server Components / API Routes)
import prisma from '@/lib/prisma/prisma'
import type {
  BackupData,
  BackupFile,
  BackupMetadata
} from '@/app/dashboard/admin/respaldos/interfaces'

export class BackupsService {
  /**
   * Genera un objeto BackupFile completo con todos los datos de la BD.
   * Las fechas se incluyen tal cual (UTC) — sin conversión a hora boliviana.
   * El frontend se encarga de la visualización en BOT mediante date.ts.
   */
  static async generarRespaldo(username: string): Promise<BackupFile> {
    // ── Consultar todas las tablas en paralelo ──────────────────────────────
    const [
      turnos_catalogo,
      especialidades,
      vacunas,
      esquema_dosis,
      roles,
      permisos,
      personas,
      usuarios,
      doctores,
      pacientes,
      roles_permisos,
      usuarios_roles,
      doctores_especialidades,
      disponibilidades,
      fichas,
      consultas,
      tratamientos,
      citas,
      notificaciones,
      auditoria_log
    ] = await Promise.all([
      prisma.turnos_catalogo.findMany(),
      prisma.especialidades.findMany(),
      prisma.vacunas.findMany(),
      prisma.esquema_dosis.findMany(),
      prisma.roles.findMany(),
      prisma.permisos.findMany(),
      prisma.personas.findMany(),
      prisma.usuarios.findMany(),
      prisma.doctores.findMany(),
      prisma.pacientes.findMany(),
      prisma.roles_permisos.findMany(),
      prisma.usuarios_roles.findMany(),
      prisma.doctores_especialidades.findMany(),
      prisma.disponibilidades.findMany(),
      prisma.fichas.findMany(),
      prisma.consultas.findMany(),
      prisma.tratamientos.findMany(),
      prisma.citas.findMany(),
      prisma.notificaciones.findMany(),
      prisma.auditoria_log.findMany()
    ])

    // ── Construir estadísticas ──────────────────────────────────────────────
    const estadisticas = {
      personas: personas.length,
      usuarios: usuarios.length,
      pacientes: pacientes.length,
      doctores: doctores.length,
      fichas: fichas.length,
      citas: citas.length,
      consultas: consultas.length,
      tratamientos: tratamientos.length,
      vacunas: vacunas.length,
      esquema_dosis: esquema_dosis.length,
      especialidades: especialidades.length,
      disponibilidades: disponibilidades.length,
      turnos_catalogo: turnos_catalogo.length,
      roles: roles.length,
      permisos: permisos.length,
      notificaciones: notificaciones.length,
      auditoria_log: auditoria_log.length
    }

    const metadata: BackupMetadata = {
      version: '1.0',
      sistema: 'Censao',
      fecha_generacion: new Date().toISOString(),
      generado_por: username,
      estadisticas
    }

    const data: BackupData = {
      turnos_catalogo: turnos_catalogo as any[],
      especialidades: especialidades as any[],
      vacunas: vacunas as any[],
      esquema_dosis: esquema_dosis as any[],
      roles: roles as any[],
      permisos: permisos as any[],
      personas: personas as any[],
      usuarios: usuarios as any[],
      doctores: doctores as any[],
      pacientes: pacientes as any[],
      roles_permisos: roles_permisos as any[],
      usuarios_roles: usuarios_roles as any[],
      doctores_especialidades: doctores_especialidades as any[],
      disponibilidades: disponibilidades as any[],
      fichas: fichas as any[],
      consultas: consultas as any[],
      tratamientos: tratamientos as any[],
      citas: citas as any[],
      notificaciones: notificaciones as any[],
      auditoria_log: auditoria_log as any[]
    }

    return { metadata, data }
  }
}
