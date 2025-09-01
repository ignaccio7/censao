import Link from 'next/link'
import { IconUser, IconSignOut, IconSettings } from '../../icons/icons'
import { useEffect, useRef, useState } from 'react'
import { signout } from '@/actions/auth/signout'

export default function DropdownMenu() {
  const [dropdownMenu, setDropdownMenu] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownMenu &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event?.target as Node)
      ) {
        setDropdownMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)

    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [dropdownMenu])

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()

  //   // simular un loader de 2 segundos
  //   await new Promise(res => setTimeout(res, 2000))

  //   // ejecutar el server action
  //   await signout()
  // }

  return (
    <div ref={dropdownRef}>
      <button
        className='text-gray-800 cursor-pointer p-1 hover:bg-gray-300 rounded-lg'
        onClick={() => setDropdownMenu(!dropdownMenu)}
      >
        <IconSettings size='24' />
      </button>
      <div
        className={`options bg-white min-w-44 absolute right-0 flex flex-col rounded-xs text-step-0 font-bold text-gray-800 shadow-md transition-all duration-200 ease-in-out
        ${dropdownMenu ? 'opacity-100 pointer-events-auto' : 'opacity-0  pointer-events-none'}`}
      >
        <Link
          className='p-3 flex flex-row items-center gap-1 hover:bg-gray-300 transition-colors duration-200'
          href='/auth/ingresar'
        >
          <IconUser size='20' />
          Cambiar de rol
        </Link>
        <hr className='border-gray-500' />
        <form className='w-full' action={signout}>
          {/* <form onSubmit={handleSubmit}> */}
          <button
            className='p-3 flex flex-row items-center gap-1 hover:bg-gray-300 transition-colors duration-200 w-full'
            type='submit'
          >
            <IconSignOut size='20' />
            Cerrar Sesion
          </button>
        </form>
      </div>
    </div>
  )
}
