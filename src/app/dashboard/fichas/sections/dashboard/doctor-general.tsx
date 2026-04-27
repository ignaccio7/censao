import {
  StateRecord,
  StateRecordValue,
  StateRecordValueType
} from '@/lib/constants'
import CustomDataTable from '@/app/components/ui/dataTable'
import { useState } from 'react'
import { StatusBadge } from '../../components/statusBadge'
import {
  IconCheckupList,
  IconStethoscope,
  IconUserCheck,
  IconAlertTriangle
} from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import usePatientStore from '@/store/patient/patient'
import { useFichas } from '@/app/services/fichas'
import { useRouter } from 'next/navigation'

/** Devuelve clase CSS de fila según estado */
const getRowStyle = (estado: string): string => {
  switch (estado) {
    case StateRecord.EN_ESPERA:
      return 'bg-blue-50 !border-l-4 !border-l-blue-400'
    case StateRecord.ATENDIENDO:
      return 'bg-purple-50 !border-l-4 !border-l-purple-500'
    default:
      return ''
  }
}

export default function DashboardDoctorGeneral({ fichas }: { fichas: any }) {
  const router = useRouter()
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false)
  const { updateFicha } = useFichas(refetchInterval)
  const [modal, setModal] = useState(false)
  const [activeTab, setActiveTab] = useState<StateRecordValueType>(
    StateRecordValue.EN_ESPERA
  )

  const allowedTabs = [
    StateRecordValue.EN_ESPERA,
    StateRecordValue.ATENDIDA,
    StateRecordValue.CANCELADA
  ]

  const fichaId = usePatientStore(state => state.fichaId)
  const estadoFicha = usePatientStore(state => state.estadoFicha)
  const setPatient = usePatientStore(state => state.setPatient)
  const clearPatient = usePatientStore(state => state.clearPatient)

  const columnas = [
    { campo: '# Ficha' },
    { campo: 'Paciente' },
    { campo: 'Especialidad' },
    { campo: 'Doctor Asignado' },
    { campo: 'Estado' },
    { campo: '' }
  ]

  const filteredFichas = fichas.filter((ficha: any) => {
    const matchedKey = Object.keys(StateRecordValue).find(
      key =>
        StateRecordValue[key as keyof typeof StateRecordValue] === activeTab
    )

    if (activeTab === StateRecordValue.EN_ESPERA) {
      return (
        ficha.estado === StateRecord.EN_ESPERA ||
        ficha.estado === StateRecord.ATENDIENDO
      )
    }

    return ficha.estado === StateRecord[matchedKey as keyof typeof StateRecord]
  })

  const contenidoTabla: any[] = filteredFichas.map(
    (ficha: any, index: number) => {
      return [
        <span
          className='font-semibold text-primary-700 text-step-1'
          key={`id-${index}`}
        >
          # {index + 1}
        </span>,
        ficha?.paciente_nombres,
        ficha?.especialidad_nombre,
        ficha?.doctor_nombre,
        <StatusBadge status={ficha.estado} key={`st-${index}`} />,
        <div key={`btn-${index}`}>
          <button
            onClick={() => {
              setPatient({
                fichaId: ficha.ficha_id as string,
                pacienteId: ficha.paciente_id as string,
                pacienteNombres: ficha.paciente_nombres as string,
                doctorNombre: ficha.doctor_nombre as string,
                especialidadNombre: ficha.especialidad_nombre as string,
                estadoFicha: ficha.estado as string
              })
              setModal(true)
            }}
          >
            <IconStethoscope
              className='cursor-pointer border border-transparent bg-primary-600 text-white py-1 rounded-md hover:border-primary-600 hover:text-primary-600 hover:bg-transparent transition-all duration-300'
              size='32'
            />
          </button>
        </div>
      ]
    }
  )

  // Paso 1: EN_ESPERA → ATENDIENDO (llamar al paciente)
  const callPatient = () => {
    updateFicha.mutateAsync({
      id: fichaId as string,
      status: StateRecord.ATENDIENDO
    })
    setModal(false)
    clearPatient()
  }

  // Paso 2a: ATENDIENDO → ATENDIDA
  const attendPatient = () => {
    updateFicha.mutateAsync({
      id: fichaId as string,
      status: StateRecord.ATENDIDA
    })
    setModal(false)
    clearPatient()
  }

  const cancelPatient = () => {
    updateFicha.mutateAsync({
      id: fichaId as string,
      status: StateRecord.CANCELADA
    })
    setModal(false)
    clearPatient()
  }

  return (
    <section className='fichas font-secondary'>
      {/* TABS + POLLING */}
      <div className='bg-white my-4 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap items-center justify-between'>
          <div className='flex flex-wrap'>
            {allowedTabs.map((state, index: number) => (
              <button
                key={index}
                className={`px-4 py-3 text-step-1 font-medium transition-colors duration-200 cursor-pointer ${
                  activeTab === state
                    ? 'text-primary-700 border-b-2 border-primary-700 bg-primary-50'
                    : 'text-gray-600 hover:text-primary-700'
                }`}
                onClick={() => setActiveTab(state)}
              >
                {state}
              </button>
            ))}
          </div>

          <div className='px-4 py-2 flex items-center gap-2'>
            <label
              htmlFor='polling-dg'
              className='text-sm text-gray-600 font-medium'
            >
              Actualizar datos:
            </label>
            <select
              id='polling-dg'
              className={`border rounded-md px-2 py-1 text-sm focus:outline-none cursor-pointer transition-colors duration-300 shadow-sm ${
                refetchInterval !== false
                  ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold focus:ring-2 focus:ring-primary-600'
                  : 'border-gray-300 text-gray-700 bg-white focus:ring-2 focus:ring-primary-500 hover:border-primary-400'
              }`}
              value={
                refetchInterval === false ? 'false' : String(refetchInterval)
              }
              onChange={e => {
                const val = e.target.value
                setRefetchInterval(val === 'false' ? false : Number(val))
              }}
            >
              <option value='false'>Manual (Desactivado)</option>
              <option value='1000'>Tiempo real (1s)</option>
              <option value='5000'>Cada 5s</option>
              <option value='30000'>Cada 30s</option>
              <option value='60000'>Cada 1 min</option>
              <option value='1800000'>Cada 30 min</option>
            </select>
          </div>
        </div>

        <div className='px-4'>
          <div className='w-full'>
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={contenidoTabla}
              estilosPersonalizadosFila={(index, _fila) =>
                getRowStyle(filteredFichas[index]?.estado ?? '')
              }
            />
          </div>
        </div>
      </div>

      {/* MODAL CONTEXTUAL */}
      <Modal
        title='Registro de consulta'
        isOpen={modal}
        onClose={() => {
          setModal(false)
          clearPatient()
        }}
      >
        {/* PASO 1: ficha en EN_ESPERA → llamar al paciente */}
        {estadoFicha === StateRecord.EN_ESPERA && (
          <div className='grid grid-cols-1 gap-4'>
            <button
              className='bg-transparent border-4 border-primary-600 text-primary-600 py-2 px-4 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-200 cursor-pointer'
              onClick={callPatient}
            >
              <span className='flex flex-col-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
                Llamar al paciente
                <IconUserCheck size='36' />
              </span>
            </button>
          </div>
        )}

        {/* PASO 2: ficha en ATENDIENDO → finalizar */}
        {estadoFicha === StateRecord.ATENDIENDO && (
          <div className='grid grid-cols-2 gap-4'>
            <button
              className='bg-transparent border-4 border-primary-600 text-primary-600 py-2 px-4 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-200 cursor-pointer'
              onClick={attendPatient}
            >
              <span className='flex flex-col-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
                Marcar como atendido
                <IconUserCheck size='36' />
              </span>
            </button>
            <button
              className='bg-transparent border-4 border-cyan-800 text-cyan-800 py-2 px-4 rounded-md hover:bg-cyan-800 hover:text-white transition-colors duration-200 cursor-pointer'
              onClick={() => {
                setModal(false)
                router.push(`/dashboard/tratamientos/${fichaId}/crear`)
              }}
            >
              <span className='flex flex-col-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
                Registrar tratamiento
                <IconCheckupList size='36' />
              </span>
            </button>
            <button
              className='col-span-2 bg-transparent border-4 border-red-400 text-red-400 py-2 px-4 rounded-md hover:bg-red-400 hover:text-white transition-colors duration-200 cursor-pointer'
              onClick={cancelPatient}
            >
              <span className='flex flex-row-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
                No asistió (Cancelar ficha)
                <IconAlertTriangle size='36' />
              </span>
            </button>
          </div>
        )}

        {/* Ficha ya en ATENDIDA o CANCELADA (solo mostrar tratamiento) */}
        {estadoFicha === StateRecord.ATENDIDA && (
          <div className='grid grid-cols-1 gap-4'>
            <button
              className='bg-transparent border-4 border-cyan-800 text-cyan-800 py-2 px-4 rounded-md hover:bg-cyan-800 hover:text-white transition-colors duration-200 cursor-pointer'
              onClick={() => {
                setModal(false)
                router.push(`/dashboard/tratamientos/${fichaId}/crear`)
              }}
            >
              <span className='flex flex-col-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
                Registrar tratamiento
                <IconCheckupList size='36' />
              </span>
            </button>
          </div>
        )}
      </Modal>
    </section>
  )
}
