'use client'

import FullScreenLoader from '@/app/components/ui/loader'
import NavbarUser from '@/app/components/ui/navbar/navbar-user'
import Sidebar from '@/app/components/ui/sidebar/sidebar'
import { secondaryFont } from '@/config/fonts'
import useProfileRoutes from '@/hooks/useProfileRoutes'
import useSidebar from '@/hooks/useSidebar'

export default function WrapperChildren({
  children
}: {
  children: React.ReactNode
}) {
  console.log('WRAPPER CHILDREN')

  const { loading } = useProfileRoutes()
  const { sidebarMenu } = useSidebar()

  if (loading) {
    return <FullScreenLoader />
  }

  return (
    <>
      <NavbarUser />
      <div
        className={`${secondaryFont.variable} antialiased bg-white-100 min-h-[var(--size-window)] w-full h-auto flex flex-row`}
      >
        <Sidebar />
        <div
          className={`w-full p-4 md:p-8 mt-[var(--size-header)] h-auto
          ${sidebarMenu ? 'md:ml-[250px] ml:0' : 'ml-0'}
          transition-all duration-200 max-w-7xl`}
        >
          {children}
        </div>
      </div>
    </>
  )
}
