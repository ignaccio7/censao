import { secondaryFont } from '@/config/fonts'
import NavbarUser from '../components/ui/navbar/navbar-user'
import Sidebar from '../components/ui/sidebar/sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarUser />
      <div
        className={`${secondaryFont.variable} antialiased bg-white-100 size-window w-full flex`}
      >
        <Sidebar />
        <div className='w-full bg-white-100 grow'>{children}</div>
      </div>
    </>
  )
}
