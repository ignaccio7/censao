import type { DictionaryProfile } from '@/interfaces'

// oxlint-disable-next-line sort-keys
const dictionaryProfile: DictionaryProfile = {
  nombres: 'Nombres',
  paterno: 'Apellido paterno',
  materno: 'Apellido materno',
  telefono: 'Número de teléfono',
  correo: 'Correo electrónico',
  direccion: 'Dirección del usuario',
  username: 'Nombre de usuario'
} as const

export default dictionaryProfile
