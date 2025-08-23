'use client'
import { secondaryFont } from '@/config/fonts'
import NavbarUser from '../components/ui/navbar/navbar-user'
import Sidebar from '../components/ui/sidebar/sidebar'
import useSidebar from '@/hooks/useSidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { sidebarMenu } = useSidebar()

  return (
    <>
      <NavbarUser />
      <div
        className={`${secondaryFont.variable} antialiased bg-white-100 size-window w-full flex`}
      >
        <Sidebar />
        <div
          className={`w-full bg-white-100 grow p-4 md:p-8 mt-[var(--size-header)]
          ${sidebarMenu ? 'md:ml-[250px] ml:0' : 'ml-0'}
          transition-all duration-200`}
        >
          {children}
        </div>
      </div>
    </>
  )
}
