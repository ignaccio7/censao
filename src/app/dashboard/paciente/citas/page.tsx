import Title from '@/app/components/ui/title'
import Calendar from './components/calendar'

export default function Page() {
  return (
    <section className='fichas font-secondary pb-20'>
      <Title className='mb-4'>Fichas programadas</Title>

      <div className='w-full h-auto max-w-5xl'>
        <Calendar />
      </div>
    </section>
  )
}
