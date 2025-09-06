import { SessionProvider } from 'next-auth/react'
import WrapperChildren from './components/wrapper-children'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <WrapperChildren>{children}</WrapperChildren>
    </SessionProvider>
  )
}
