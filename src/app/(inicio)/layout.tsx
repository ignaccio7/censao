import type { Metadata } from 'next'
import NavbarIndex from '../components/ui/navbar/navbar-index'

export const metadata: Metadata = {
  description: 'Centro de salud para atencion medica de pacientes',
  title: 'CENSAO - Centro de salud Alto Obrajes'
}

export default function Layout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <NavbarIndex />
      {children}
    </>
  )
}
