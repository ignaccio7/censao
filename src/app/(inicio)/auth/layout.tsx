import type { Metadata } from 'next'

export const metadata: Metadata = {
  description: 'Página de inicio de sesíon',
  title: 'Inicia sesión'
}

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <main className='bg-white-100 w-full size-window flex justify-center items-center'>
      {children}
    </main>
  )
}
