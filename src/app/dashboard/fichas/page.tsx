'use client'
import { IconMonitor, IconPlus, IconTeam } from '@/app/components/icons/icons'
import Modal from '@/app/components/ui/modal/modal'
import Title from '@/app/components/ui/title'
import useModal from '@/hooks/useModal'

export default function PageFichas() {
  const { modal, closeModal, openModal } = useModal()

  return (
    <section className='fichas font-secondary'>
      <div className='w-full flex justify-between items-center gap-2 mb-4'>
        <Title
          className='w-fit'
          subtitle='Configura las fichas de los pacientes'
        >
          Gestión de fichas
        </Title>
        <span className='px-4 py-2 bg-primary-200 text-primary-700 font-semibold rounded-full text-step-0 border border-primary-300'>
          Turno: Mañana
        </span>
      </div>
      {/* TARJETAS DE FICHAS */}
      <div className='cards-information grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-4'>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col  w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Pacientes en espera
            <small>
              <IconTeam className='text-primary-700' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-primary-700'>13</p>
        </div>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col  w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Pacientes en consulta
            <small>
              <IconMonitor className='text-secondary-600' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-secondary-600'>10</p>
        </div>
        <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col  w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
          <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
            Emergencias
            <small>
              <IconTeam className='text-quaternary-500' size='26' />
            </small>
          </h3>
          <p className='number text-step-4 font-bold text-quaternary-500'>1</p>
        </div>
      </div>
      {/* GESTION DE FICHAS */}
      <div className='actions py-4 flex gap-2 justify-start items-center'>
        <button
          className='flex gap-2 items-center bg-primary-700 text-white py-2 px-4 text-step-1 rounded-lg hover:bg-primary-800 transition-colors duration-200 cursor-pointer'
          onClick={openModal}
        >
          <IconPlus />
          Registrar nueva ficha
        </button>
      </div>
      <Modal title='Registrar nueva ficha' isOpen={modal} onClose={closeModal}>
        <p>
          {JSON.stringify(modal)}
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus
          explicabo minus, saepe deserunt ea sit dicta consectetur in
          reprehenderit, mollitia ipsam ducimus, fugiat odit a at. Tempore,
          vero. Obcaecati, nostrum.
        </p>
      </Modal>
      {/* ACCIONES */}
      {/* TABLA DE REGISTROS */}
    </section>
  )
}
