export const RECORD_TYPES = {
  PENDIENTE: 'En espera',
  ATENCION: 'En consulta',
  ATENDIDO: 'Atendido',
  CANCELADO: 'Cancelado',
  URGENTE: 'Emergencia'
} as const

export type RecordType = (typeof RECORD_TYPES)[keyof typeof RECORD_TYPES]
// // ahora quiero las llaves
// export type RecordTypeKey = keyof typeof RECORD_TYPES
