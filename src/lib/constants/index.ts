export const Roles = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  PACIENTE: 'PACIENTE',
  DOCTOR_FICHAS: 'DOCTOR_FICHAS',
  DOCTOR_GENERAL: 'DOCTOR_GENERAL',
  ENFERMERIA: 'ENFERMERIA'
} as const

export type RoleType = (typeof Roles)[keyof typeof Roles]

export const RoleGroups = {
  DOCTOR: [Roles.DOCTOR_FICHAS, Roles.DOCTOR_GENERAL, Roles.ENFERMERIA],
  PACIENTE: [Roles.PACIENTE],
  ADMINISTRADOR: [Roles.ADMINISTRADOR]
} as const

export const RoleValue = {
  [Roles.DOCTOR_FICHAS]: 'Doctor Admision',
  [Roles.DOCTOR_GENERAL]: 'Doctor General',
  [Roles.ENFERMERIA]: 'Enfermeria',
  [Roles.ADMINISTRADOR]: 'Administrador',
  [Roles.PACIENTE]: 'Paciente'
} as const

export const StateRecord = {
  ADMISION: 'ADMISION',
  ENFERMERIA: 'ENFERMERIA',
  EN_ESPERA: 'EN_ESPERA',
  ATENDIENDO: 'ATENDIENDO',
  ATENDIDA: 'ATENDIDA',
  CANCELADA: 'CANCELADA'
} as const

export const StateRecordValue = {
  ADMISION: 'En Admision',
  ENFERMERIA: 'En Enfermeria',
  EN_ESPERA: 'En Espera',
  ATENDIENDO: 'Atendiendo',
  ATENDIDA: 'Atentidos',
  CANCELADA: 'Cancelados'
} as const

export type StateRecordType = keyof typeof StateRecordValue
export type StateRecordValueType =
  (typeof StateRecordValue)[keyof typeof StateRecordValue]

export const StateTreatment = {
  EN_CURSO: 'EN_CURSO',
  COMPLETADA: 'COMPLETADA',
  INCOMPLETA: 'INCOMPLETA'
} as const

export const StateTreatmentValue = {
  EN_CURSO: 'En curso',
  COMPLETADA: 'Completada',
  INCOMPLETA: 'Incompleta'
} as const

export type StateTreatmentType = keyof typeof StateTreatmentValue
export type StateTreatmentValueType =
  (typeof StateTreatmentValue)[keyof typeof StateTreatmentValue]
