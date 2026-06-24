import Link from 'next/link'

export default function Footer() {
  return (
    <footer className='bg-primary-800 text-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div>
            <div className='flex items-center space-x-2 mb-4'>
              <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-foreground'>
                <svg
                  className='h-5 w-5 text-primary'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
                  />
                </svg>
              </div>
              <span className='text-xl font-bold'>Centro de Salud</span>
            </div>
            <p className='text-primary-foreground/80 leading-relaxed'>
              Comprometidos con tu salud y bienestar. Ofrecemos servicios
              médicos de calidad con un enfoque preventivo.
            </p>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Servicios</h3>
            <ul className='space-y-2 text-primary-foreground/80'>
              <li>
                <Link
                  href='/campanas'
                  className='hover:text-primary-foreground transition-colors'
                >
                  Campañas de Vacunación
                </Link>
              </li>
              <li>
                <Link
                  href='/consultas'
                  className='hover:text-primary-foreground transition-colors'
                >
                  Consultas Médicas
                </Link>
              </li>
              <li>
                <Link
                  href='/emergencias'
                  className='hover:text-primary-foreground transition-colors'
                >
                  Atención general
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Información</h3>
            <ul className='space-y-2 text-primary-foreground/80'>
              <li>
                <Link
                  href='/sobre-nosotros'
                  className='hover:text-primary-foreground transition-colors'
                >
                  Sobre Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href='/equipo-medico'
                  className='hover:text-primary-foreground transition-colors'
                >
                  Equipo Médico
                </Link>
              </li>
              <li>
                <Link
                  href='/horarios'
                  className='hover:text-primary-foreground transition-colors'
                >
                  Horarios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-4'>Contacto</h3>
            <div className='space-y-2 text-primary-foreground/80'>
              <p>📍 Av. Maestro, Alto Obrajes</p>
              {/* <p>📞 (555) 123-4567</p> */}
              {/* <p>✉️ info@centrodesalud.com</p> */}
              <p>
                🕒 Lunes - Viernes
                {/* : 8:00-18:00 */}
              </p>
            </div>
          </div>
        </div>

        <div className='border-t border-primary-foreground/20 mt-8 pt-8 text-center text-primary-foreground/80'>
          <p>&copy; 2026 Centro de Salud. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
