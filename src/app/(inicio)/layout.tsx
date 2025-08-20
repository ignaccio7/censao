import type { Metadata } from 'next'
import NavbarIndex from '../components/ui/navbar/navbar-index'

export const metadata: Metadata = {
  description: 'Description of the page',
  title: 'Page Title'
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
