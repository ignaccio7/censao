'use client'
import Link from 'next/link'
import { IconCloseSidebar, IconHeart, IconOpenSidebar } from '../icons'
import useSidebar from '@/hooks/useSidebar'

export default function NavbarUser() {
  const { sidebarMenu, openSidebar, closeSidebar } = useSidebar()

  const handleSidebar = () => {
    console.log(sidebarMenu)

    if (sidebarMenu) {
      closeSidebar()
    } else {
      openSidebar()
    }
  }

  return (
    <header className='size-header w-full bg-primary-700 text-white font-primary'>
      <nav className='h-full flex justify-between items-center gap-2 px-4'>
        <button
          onClick={handleSidebar}
          className='logo primary-font font-semibold flex gap-0 items-center text-step-1 cursor-pointer'
        >
          {sidebarMenu ? <IconCloseSidebar /> : <IconOpenSidebar />}
          CENSA
          <IconHeart
            size='20'
            className='p-1 border border-white rounded-full text-white'
          />
        </button>
        <div className={`user secondary-font`}>
          <Link href='/auth/ingresar'>Salir</Link>
        </div>
      </nav>
    </header>
  )
}
