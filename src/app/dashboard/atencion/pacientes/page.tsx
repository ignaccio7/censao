import Title from '@/app/components/ui/title'

export default function Pacientes() {
  return (
    <section className='fichas font-secondary'>
      <div className='w-full flex justify-between items-center gap-2 mb-4'>
        <Title
          className='w-fit'
          subtitle='Configura las fichas de los pacientes'
        >
          Pacientes
        </Title>
        <span className='px-4 py-2 bg-primary-200 text-primary-700 font-semibold rounded-full text-step-0 border border-primary-300'>
          Turno: Mañana
        </span>
      </div>
    </section>
  )
}
