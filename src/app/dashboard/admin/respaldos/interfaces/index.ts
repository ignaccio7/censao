// src/app/dashboard/admin/respaldos/interfaces/index.ts

export interface BackupEstadisticas {
  personas: number
  usuarios: number
  pacientes: number
  doctores: number
  fichas: number
  citas: number
  consultas: number
  tratamientos: number
  vacunas: number
  esquema_dosis: number
  especialidades: number
  disponibilidades: number
  turnos_catalogo: number
  roles: number
  permisos: number
  notificaciones: number
  auditoria_log: number
}

export interface BackupMetadata {
  version: string
  sistema: 'Censao'
  fecha_generacion: string // ISO 8601 UTC
  generado_por: string
  estadisticas: BackupEstadisticas
}

// Registro genérico — Prisma devuelve objetos con fechas como Date,
// pero al serializar a JSON se convierten a strings ISO 8601 UTC.
// Al restaurar, se reciben como strings y Prisma los convierte de vuelta.
export type RegistroGenerico = Record<string, unknown>

export interface BackupData {
  turnos_catalogo: RegistroGenerico[]
  especialidades: RegistroGenerico[]
  vacunas: RegistroGenerico[]
  esquema_dosis: RegistroGenerico[]
  roles: RegistroGenerico[]
  permisos: RegistroGenerico[]
  personas: RegistroGenerico[]
  usuarios: RegistroGenerico[]
  doctores: RegistroGenerico[]
  pacientes: RegistroGenerico[]
  roles_permisos: RegistroGenerico[]
  usuarios_roles: RegistroGenerico[]
  doctores_especialidades: RegistroGenerico[]
  disponibilidades: RegistroGenerico[]
  fichas: RegistroGenerico[]
  consultas: RegistroGenerico[]
  tratamientos: RegistroGenerico[]
  citas: RegistroGenerico[]
  notificaciones: RegistroGenerico[]
  auditoria_log: RegistroGenerico[]
}

export interface BackupFile {
  metadata: BackupMetadata
  data: BackupData
}
