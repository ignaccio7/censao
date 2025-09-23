import { SessionProvider } from 'next-auth/react'
import WrapperChildren from './components/wrapper-children'
import QueryProvider from '../components/ui/tanstack/query-provider'
import { Toaster } from 'sonner'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <SessionProvider>
      <Toaster />
      <QueryProvider>
        <WrapperChildren>{children}</WrapperChildren>
      </QueryProvider>
    </SessionProvider>
  )
}
