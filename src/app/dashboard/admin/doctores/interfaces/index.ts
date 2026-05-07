export interface DoctorListItem {
  doctor_id: string
  matricula: string | null
  personas: {
    ci: string
    nombres: string
    paterno: string | null
    materno: string | null
  }
  doctores_especialidades: {
    id: string
    especialidades: { id: string; nombre: string; estado: boolean }
    disponibilidades: {
      id: string
      turno_codigo: string
      cupos: number
      estado: boolean
    }[]
  }[]
}
