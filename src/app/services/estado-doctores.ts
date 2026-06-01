// oxlint-disable prefer-default-export
// oxlint-disable func-style
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from './client'

export interface FichaEstado {
  id: string
  estado: string
  orden_turno: number | null
  pacientes: {
    paciente_id: string
    personas: {
      nombres: string
      paterno: string | null
      materno: string | null
    }
  }
}

export interface DoctorTurno {
  doctorId: string
  nombre: string
  especialidadId: string
  especialidadNombre: string
  fichasActivas: FichaEstado[] // EN_ESPERA, ATENDIENDO, CANCELADA
  fichasTotal: number
  cuposMaximos: number
}

/** Transforma la respuesta de /api/doctor al formato que necesita la UI */
function transformarDoctores(data: any[]): DoctorTurno[] {
  const doctoresMap = new Map<string, DoctorTurno>()

  const estadosActivos = ['EN_ESPERA', 'ATENDIENDO', 'CANCELADA']

  data?.forEach(especialidad => {
    especialidad.doctores_especialidades?.forEach((docEsp: any) => {
      const doctorId = docEsp.doctores.doctor_id
      const persona = docEsp.doctores.personas
      const nombre =
        `${persona.nombres} ${persona.paterno || ''} ${persona.materno || ''}`.trim()

      // Si el doctor no tiene disponibilidades para el turno actual, no lo mostramos
      if (!docEsp.disponibilidades || docEsp.disponibilidades.length === 0) {
        return
      }

      // Aplanar todas las fichas de todas las disponibilidades de este doctor
      const todasLasFichas: FichaEstado[] = docEsp.disponibilidades.flatMap(
        (disp: any) => disp.fichas || []
      )

      const fichasActivas = todasLasFichas.filter(f =>
        estadosActivos.includes(f.estado)
      )

      const cuposMaximos = docEsp.disponibilidades.reduce(
        (total: number, disp: any) => total + (disp.cupos || 0),
        0
      )

      const key = `${doctorId}-${especialidad.id}`
      if (!doctoresMap.has(key)) {
        doctoresMap.set(key, {
          doctorId,
          nombre,
          especialidadId: especialidad.id,
          especialidadNombre: especialidad.nombre,
          fichasActivas,
          fichasTotal: todasLasFichas.length,
          cuposMaximos
        })
      }
    })
  })

  return Array.from(doctoresMap.values())
}

export function useEstadoDoctores() {
  const estadoDoctoresQuery = useQuery({
    queryKey: ['doctor'],
    queryFn: async () => {
      const response = await apiClient.get('/doctor')
      return response.data.data
    },
    staleTime: 30 * 1000 // 30s
  })

  const doctores = transformarDoctores(estadoDoctoresQuery.data || [])

  return {
    doctores,
    isLoading: estadoDoctoresQuery.isLoading,
    isError: estadoDoctoresQuery.isError,
    refetch: estadoDoctoresQuery.refetch
  }
}

export function useReasignarDoctor() {
  const queryClient = useQueryClient()

  const reasignarMutation = useMutation({
    mutationFn: async (data: {
      doctorOrigenId: string
      especialidadId: string
      doctorDestinoId: string
    }) => {
      const response = await apiClient.post('/fichas/reasignar-doctor', data)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fichas'] })
      queryClient.invalidateQueries({ queryKey: ['doctor'] })
    }
  })

  return { reasignarDoctor: reasignarMutation }
}
