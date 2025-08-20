import Link from 'next/link'
import { IconHeart, IconSearch } from '../icons'

export default function NavbarIndex() {
  return (
    <header className='size-header w-full bg-primary-700 text-white font-primary'>
      <nav className='container h-full flex justify-between items-center gap-2'>
        <Link
          href='/'
          className='logo primary-font font-semibold flex gap-0 items-center text-step-1'
        >
          CENSA
          <IconHeart
            size='20'
            className='p-1 border border-white rounded-full text-white'
          />
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
