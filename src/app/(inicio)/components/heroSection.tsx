export default function HeroSection() {
  return (
    <section className='relative bg-gradient-to-br from-primary/5 to-accent/5 py-20 lg:py-32'>
      <div className='container mx-auto px-4'>
        <div className='grid lg:grid-cols-2 gap-12 items-center'>
          <div className='space-y-6'>
            <h1 className='text-4xl lg:text-6xl font-black text-foreground leading-tight'>
              Protege tu Salud
            </h1>
            <p className='text-xl lg:text-2xl text-muted-foreground font-medium'>
              Infórmate sobre nuestras{' '}
              <span className='text-primary font-semibold'>
                Campañas de Vacunación
              </span>{' '}
              y mantén a tu familia protegida
            </p>
            <p className='text-lg text-muted-foreground leading-relaxed'>
              Nuestro centro de salud ofrece las vacunas más actualizadas con
              personal médico especializado. Tu bienestar es nuestra prioridad.
            </p>
            <div className='flex flex-col sm:flex-row gap-4'>
              <button className='text-lg px-8 py-3 bg-primary-600 text-white rounded-lg'>
                Ver Campañas Activas
              </button>
              <button className='text-lg px-8 py-3 bg-transparent shadow-xl '>
                Agendar Cita
              </button>
            </div>
          </div>

          <div className='relative'>
            <img
              src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUGz9LVXZZnHLLORcpPm_WOIk7nM3J2ACDcg&s'
              alt='Profesional de la salud en centro médico'
              className='rounded-lg shadow-2xl w-full h-auto'
            />
            <div className='absolute -bottom-6 -left-6 bg-primary-700 text-white p-4 rounded-lg shadow-lg'>
              <div className='text-2xl font-bold'>+10,000</div>
              <div className='text-sm'>Vacunas aplicadas</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
