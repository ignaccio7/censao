import { SessionProvider } from 'next-auth/react'
import WrapperChildren from './components/wrapper-children'
import QueryProvider from '../components/ui/tanstack/query-provider'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <QueryProvider>
        <WrapperChildren>{children}</WrapperChildren>
      </QueryProvider>
    </SessionProvider>
  )
}
