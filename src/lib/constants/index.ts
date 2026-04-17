export const Roles = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  PACIENTE: 'PACIENTE',
  DOCTOR_FICHAS: 'DOCTOR_FICHAS',
  DOCTOR_GENERAL: 'DOCTOR_GENERAL'
} as const

export type RoleType = (typeof Roles)[keyof typeof Roles]

export const RoleGroups = {
  DOCTOR: [Roles.DOCTOR_FICHAS, Roles.DOCTOR_GENERAL],
  PACIENTE: [Roles.PACIENTE],
  ADMINISTRADOR: [Roles.ADMINISTRADOR]
} as const

export const StateRecord = {
  ADMISION: 'ADMISION',
  ENFERMERIA: 'ENFERMERIA',
  ATENDIDA: 'ATENDIDA',
  CANCELADA: 'CANCELADA'
} as const

export const StateRecordValue = {
  ADMISION: 'En Admision',
  ENFERMERIA: 'En Enfermeria',
  ATENDIDA: 'Atentidos',
  CANCELADA: 'Cancelados'
} as const

export type StateRecordType = keyof typeof StateRecordValue
export type StateRecordValueType =
  (typeof StateRecordValue)[keyof typeof StateRecordValue]
