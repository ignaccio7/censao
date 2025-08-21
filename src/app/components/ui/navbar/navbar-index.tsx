import Link from 'next/link'
import { IconSearch } from '../../icons/icons'
import Logo from '../logo'

export default function NavbarIndex() {
  return (
    <header className='size-header w-full shadow-md text-black font-primary z-50 backdrop-blur-md sticky to-0'>
      <nav className='container h-full flex justify-between items-center gap-2'>
        <Link href='/'>
          <Logo />
        </Link>
        <search className='text-step-1'>
          <form className='max-w-md mx-auto'>
            <div className='relative'>
              <div className='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
                <IconSearch className='text-gray-400' />
              </div>
              <input
                type='search'
                id='default-search'
                className='block w-full p-1 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:border-gray-400 focus:outline-0'
                placeholder='Algo que buscar...'
                required
              />
            </div>
          </form>
        </search>
        <div className='user'>
          <Link href='/auth/ingresar'>Ingresar</Link>
        </div>
      </nav>
    </header>
  )
}
