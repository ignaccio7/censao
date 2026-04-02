import { create } from 'zustand'

interface PatientState {
  fichaId: string | null
  pacienteId: string | null
  pacienteNombres: string | null
  doctorNombre: string | null
  especialidadNombre: string | null
  setPatient: (patient: PatientState) => void
  clearPatient: () => void
}

const usePatientStore = create<PatientState>((set, _) => ({
  fichaId: null,
  pacienteId: null,
  pacienteNombres: null,
  doctorNombre: null,
  especialidadNombre: null,

  setPatient: (patient: any) => {
    set({
      fichaId: patient.fichaId,
      pacienteId: patient.pacienteId,
      pacienteNombres: patient.pacienteNombres,
      doctorNombre: patient.doctorNombre,
      especialidadNombre: patient.especialidadNombre
    })
  },

  clearPatient: () => {
    set({
      fichaId: null,
      pacienteId: null,
      pacienteNombres: null,
      doctorNombre: null,
      especialidadNombre: null
    })
  }
}))

export default usePatientStore
