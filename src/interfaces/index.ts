// oxlint-disable group-exports
// Interface para la tabla personas
export interface Persona {
  //id: string
  ci?: string | null
  nombres: string
  paterno?: string | null
  materno?: string | null
  telefono?: string | null
  correo?: string | null
  direccion?: string | null
}

// Interface para la tabla usuarios
export interface Usuario {
  usuario_id: string
  username: string
  password_hash: string
  activo: boolean
}

// Interface para la tabla roles
export interface Rol {
  id: string
  codigo: string
  nombre: string
  descripcion?: string | null
}

// Interface para la tabla doctores
export interface Doctor {
  doctor_id: string
  matricula: string
}

// Interface para la relación usuarios_roles
export interface UsuarioRol {
  usuario_id: string
  rol_id: string
  desde: string
  hasta?: string | null
}

// Interface para la tabla pacientes
export interface Paciente {
  paciente_id: string
  nro_historia_clinica: string
  fecha_nacimiento?: string | null
  sexo?: string | null
  grupo_sanguineo?: string | null
}

// Interface para la tabla permisos
export interface Permiso {
  id: string
  nombre: string
  ruta: string
  metodos: string[]
  icono?: string | null
  descripcion?: string | null
  modulo?: string | null
}

// Interface para la relación roles_permisos
export interface RolPermiso {
  rol_id: string
  permiso_id: string
}

// Interface para la tabla turnos_catalogo
export interface TurnoCatalogo {
  codigo: string
  nombre: string
  hora_inicio: string
  hora_fin: string
}

// Interface para la tabla disponibilidades
export interface Disponibilidad {
  id: string
  doctor_id: string
  fecha: string
  turno_codigo: string
  cupos: number
  observacion?: string | null
}

// Interface para la tabla fichas
export interface Ficha {
  id: string
  paciente_id: string
  disponibilidad_id: string
  fecha_hora: string
  turno?: string | null
  motivo?: string | null
  orden_turno?: number | null
  ficha_original_id?: string | null
}

// Interface para la tabla vacunas
export interface Vacuna {
  id: string
  nombre: string
  descripcion?: string | null
  fabricante?: string | null
}

// Interface para la tabla esquema_dosis
export interface EsquemaDosis {
  id: string
  vacuna_id: string
  numero: number
  intervalo_dias: number
  edad_min_meses?: number | null
  notas?: string | null
}

// Interface para la tabla tratamientos
export interface Tratamiento {
  id: string
  nombre: string
  ficha_id: string
  esquema_id: string
}

// Interface para la tabla notificaciones
export interface Notificacion {
  id: string
  paciente_id: string
  titulo: string
  mensaje: string
  fecha_envio: string
  leido: boolean
  medio: string
  tratamiento_id: string
}

// Interface para la tabla auditoria_log (solo campos principales)
export interface AuditoriaLog {
  id: number
  nombre_tabla: string
  registro_id: string
  accion: string
  registro_antiguo: any
  registro_nuevo: any
  fecha_cambio: string
  usuario_id: string
}

// Interfaces extendidas para relaciones
export interface PersonaCompleta extends Persona {
  usuario?: Usuario
  doctor?: Doctor
  paciente?: Paciente
}

export type PersonaCompletaProps = Persona &
  Partial<Omit<Usuario, 'usuario_id'>> &
  Partial<Omit<Doctor, 'doctor_id'>> &
  Partial<Omit<Paciente, 'paciente_id'>>

export type PersonaKeys = keyof PersonaCompletaProps

export type DictionaryProfile = {
  [Key in PersonaKeys]?: string
}

export interface UsuarioCompleto extends Usuario {
  persona: Persona
  roles: Rol[]
}

export interface DoctorCompleto extends Doctor {
  persona: Persona
}

export interface PacienteCompleto extends Paciente {
  persona: Persona
}

export interface FichaCompleta extends Ficha {
  paciente: PacienteCompleto
  disponibilidad: Disponibilidad
}

export interface DisponibilidadCompleta extends Disponibilidad {
  doctor: DoctorCompleto
  turno: TurnoCatalogo
}
