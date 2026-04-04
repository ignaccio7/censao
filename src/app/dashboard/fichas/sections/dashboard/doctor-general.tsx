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
  IconUserCheck
} from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import usePatientStore from '@/store/patient/patient'
import { useFichas } from '@/app/services/fichas'

export default function DashboardDoctorGeneral({ fichas }: { fichas: any }) {
  console.log(fichas)

  const { updateFicha } = useFichas()
  const [modal, setModal] = useState(false)
  const [activeTab, setActiveTab] = useState<StateRecordValueType>(
    StateRecordValue.PENDIENTE
  )
  const fichaId = usePatientStore(state => state.fichaId)
  const setPatient = usePatientStore(state => state.setPatient)
  const clearPatient = usePatientStore(state => state.clearPatient)

  const columnas = [
    {
      campo: '# Ficha'
    },
    {
      campo: 'Paciente'
    },
    {
      campo: 'Especialidad'
    },
    {
      campo: 'Doctor Asignado'
    },
    {
      campo: 'Estado'
    },
    {
      campo: ''
    }
  ]

  const filteredFichas = fichas.filter((ficha: any) => {
    const matchedKey = Object.keys(StateRecordValue).find(
      key =>
        StateRecordValue[key as keyof typeof StateRecordValue] === activeTab
    )
    return ficha.estado === StateRecord[matchedKey as keyof typeof StateRecord]
  })

  const contenidoTabla: any[] = filteredFichas.map(
    (ficha: any, index: number) => {
      return [
        <span
          className='font-semibold text-primary-700 text-step-1'
          key={index}
        >
          # {index + 1}
        </span>,
        ficha?.paciente_nombres,
        ficha?.especialidad_nombre,
        ficha?.doctor_nombre,
        <StatusBadge status={ficha.estado} key={index} />,
        <div key={`button-${index}`}>
          <button
            onClick={() => {
              const patient = {
                fichaId: ficha.ficha_id as string,
                pacienteId: ficha.paciente_id as string,
                pacienteNombres: ficha.paciente_nombres as string,
                doctorNombre: ficha.doctor_nombre as string,
                especialidadNombre: ficha.especialidad_nombre as string
              }

              setPatient(patient)
              setModal(true)
            }}
          >
            <IconStethoscope
              className='cursor-pointer border border-transparent bg-primary-600 text-white py-1 rounded-md hover:border-primary-600 hover:text-primary-600 hover:bg-transparent transition-all duration-300'
              size='32'
              key={index}
            />
          </button>
        </div>
      ]
    }
  )

  const attendPatient = () => {
    updateFicha.mutateAsync({
      id: fichaId as string,
      status: StateRecord.ATENDIDA // status instead of state
    })
    setModal(false)
    clearPatient()
  }

  return (
    <section className='fichas font-secondary'>
      {/* TABS */}
      <div className='bg-white my-4 rounded-md'>
        <div className='border-b border-gray-200 flex flex-wrap'>
          {Object.values(StateRecordValue).map((state, index: number) => (
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

        <div className='px-4'>
          <div className='w-full'>
            <CustomDataTable
              columnas={columnas}
              contenidoTabla={contenidoTabla}
            />
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        title='Registro de consulta'
        isOpen={modal}
        onClose={() => setModal(false)}
      >
        <div className='grid grid-cols-2 gap-4'>
          <button
            className='bg-transparent border-4 border-primary-600 text-primary-600 py-2 px-4 rounded-md hover:bg-primary-600 hover:text-white transition-colors duration-200 cursor-pointer'
            onClick={attendPatient}
          >
            <span className='flex flex-col-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
              Marcar como paciente atendido
              <IconUserCheck size='36' />
            </span>
          </button>
          <button className='bg-transparent border-4 border-cyan-800 text-cyan-800 py-2 px-4 rounded-md hover:bg-cyan-800 hover:text-white transition-colors duration-200 cursor-pointer'>
            {' '}
            <span className='flex flex-col-reverse justify-center items-center gap-2 font-semibold text-step-0 uppercase'>
              Registrar tratamiento <IconCheckupList size='36' />
            </span>
          </button>
        </div>
      </Modal>
    </section>
  )
}
