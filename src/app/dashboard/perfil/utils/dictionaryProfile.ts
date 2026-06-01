import type { DictionaryProfile } from '@/interfaces'

// oxlint-disable-next-line sort-keys
const dictionaryProfile: DictionaryProfile = {
  ci: 'Cédula de Identidad',
  nombres: 'Nombres',
  paterno: 'Apellido paterno',
  materno: 'Apellido materno',
  telefono: 'Número de teléfono',
  correo: 'Correo electrónico',
  direccion: 'Dirección del usuario',
  username: 'Nombre de usuario'
} as const

export default dictionaryProfile
