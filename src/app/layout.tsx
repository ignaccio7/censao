import type { Metadata } from 'next'
import './globals.css'
import { primaryFont } from '@/config/fonts'

export const metadata: Metadata = {
  description: 'Centro de salud - Alto Obrajes abierto de Lunes a Viernes.',
  title: 'Censao - Alto Obrajes'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='es' className={`${primaryFont.variable}`}>
      <body className='antialiased'>
        <main className='w-full overflow-x-hidden'>{children}</main>
      </body>
    </html>
  )
}
