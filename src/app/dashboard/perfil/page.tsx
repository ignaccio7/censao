// oxlint-disable sort-keys
import { auth } from '@/auth'
import { IconUser } from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'
import prisma from '@/lib/prisma/prisma'
import { redirect } from 'next/navigation'
import FormProfileData from './components/formProfileData'

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/dashboard')
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: {
      username: true,
      personas: {
        select: {
          ci: true,
          nombres: true,
          paterno: true,
          materno: true,
          correo: true,
          direccion: true
        }
      }
    }
  })

  if (!usuario || !usuario.personas) {
    redirect('/dashboard')
  }

  const { ci, nombres, paterno, materno, correo, direccion } = usuario.personas

  return (
    <section className='font-secondary'>
      <Title className='mb-2'>Tus datos</Title>
      <div className='content flex gap-4 flex-wrap'>
        <div className='image h-auto min-h-40 max-h-44 md:min-h-64 w-full md:max-w-xs border border-gray-300 rounded-xl grid justify-center items-center bg-white'>
          <IconUser size='64' />
        </div>
        <div className='data text-step-1 grow basis-xs'>
          <FormProfileData
            ci={ci}
            nombres={nombres}
            paterno={paterno ?? undefined}
            materno={materno ?? undefined}
            correo={correo ?? undefined}
            direccion={direccion ?? undefined}
          />
        </div>
      </div>
    </section>
  )
}
