// oxlint-disable sort-keys
'use client'
import { IconUser } from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'
import type { PersonaCompleta } from '@/interfaces'
import FormProfileData from './components/formProfileData'
// import { useSession } from 'next-auth/react'

export default function Page() {
  // const { data: session } = useSession()

  const data = {
    personas: {
      nombres: 'Juan',
      paterno: 'Perez',
      materno: 'Lopez',
      correo: 'juanperez@gmail.com',
      direccion: 'Avenida siempre vivda, 123'
    },
    usuarios: {
      username: 'juanperez'
    }
  }

  const profileData: PersonaCompleta = Object.assign({}, ...Object.values(data))

  return (
    <section className='font-secondary'>
      <Title className='mb-2'>Tus datos</Title>
      <div className='content flex gap-4 flex-wrap'>
        <div className='image h-auto min-h-40 max-h-44 md:min-h-64 w-full md:max-w-xs border border-gray-300 rounded-xl grid justify-center items-center bg-white'>
          <IconUser size='64' />
        </div>
        <div className='data text-step-1 grow basis-xs'>
          <FormProfileData {...profileData} />
        </div>
      </div>
    </section>
  )
}
