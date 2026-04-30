// TODO: revisar estas interfaces si usar por carpeta o en el global
export interface Usuario {
  usuario_id: string
  persona_ci: string
  username: string
  password_hash: string
  activo: boolean
  creado_en: Date
  creado_por: string | null
  actualizado_en: Date
  actualizado_por: string | null
  eliminado_en: Date | null
  eliminado_por: string | null
  usuarios_roles: { roles: { nombre: string } }[]
  personas: { nombres: string; paterno: string; materno: string }
}
