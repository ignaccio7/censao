export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PACIENTE = 'PACIENTE',
  DOCTOR_FICHAS = 'DOCTOR_FICHAS',
  ENFERMERIA = 'ENFERMERIA',
  DOCTOR_GENERAL = 'DOCTOR_GENERAL'
}

export const Roles = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  PACIENTE: 'PACIENTE',
  DOCTOR_FICHAS: 'DOCTOR_FICHAS',
  ENFERMERIA: 'ENFERMERIA',
  DOCTOR_GENERAL: 'DOCTOR_GENERAL'
} as const

export type RoleType = (typeof Roles)[keyof typeof Roles]

export const RoleGroups = {
  DOCTOR: [Roles.DOCTOR_FICHAS, Roles.DOCTOR_GENERAL],
  PACIENTE: [Roles.PACIENTE],
  ADMINISTRADOR: [Roles.ADMINISTRADOR]
} as const

export const RECORD_TYPES = {
  ADMISION: 'ADMISION',
  ENFERMERIA: 'ENFERMERIA',
  ATENDIDA: 'ATENDIDA',
  CANCELADA: 'CANCELADA'
} as const

export type RecordType = (typeof RECORD_TYPES)[keyof typeof RECORD_TYPES]
// // ahora quiero las llaves
// export type RecordTypeKey = keyof typeof RECORD_TYPES
