'use client'
import { IconCloseSidebar, IconOpenSidebar } from '../../icons/icons'
import useSidebar from '@/hooks/useSidebar'
import Logo from '../logo'
import DropdownMenu from './dropdownMenu'
import Notifications from './notifications'
import useUser from '@/hooks/useUser'
import { Roles } from '@/app/api/lib/constants'

export default function NavbarUser() {
  const { sidebarMenu, openSidebar, closeSidebar } = useSidebar()
  const { user } = useUser()
  const role = user.role || ''

  const handleSidebar = () => {
    if (sidebarMenu) {
      closeSidebar()
    } else {
      openSidebar()
    }
  }

  return (
    <header className='size-header w-full text-black font-primary fixed top-0 z-50 backdrop-blur-md shadow-md'>
      <nav className='h-full flex justify-between items-center gap-2 px-4'>
        <button onClick={handleSidebar}>
          <Logo>
            {sidebarMenu ? <IconCloseSidebar /> : <IconOpenSidebar />}
          </Logo>
        </button>
        <div className='user secondary-font relative flex flex-row gap-1'>
          {role === Roles.PACIENTE && <Notifications />}
          <DropdownMenu />
        </div>
      </nav>
    </header>
  )
}
