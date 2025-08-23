// oxlint-disable sort-keys

const stats = [
  { number: '15+', label: 'Años de experiencia' },
  { number: '50,000+', label: 'Pacientes atendidos' },
  { number: '98%', label: 'Satisfacción del paciente' },
  { number: '24/7', label: 'Atención de emergencias' }
]

const testimonials = [
  {
    name: 'María González',
    text: 'Excelente atención y profesionalismo. Me siento segura vacunándome aquí.',
    role: 'Paciente'
  },
  {
    name: 'Dr. Carlos Ruiz',
    text: 'Un centro de salud comprometido con la prevención y el bienestar comunitario.',
    role: 'Médico colaborador'
  }
]

export default function TrustSection() {
  return (
    <section className='py-16'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl lg:text-4xl font-bold mb-4'>
            Confianza y Experiencia
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Nuestro compromiso con la salud comunitaria nos respalda con años de
            experiencia y miles de pacientes satisfechos.
          </p>
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16'>
          {stats.map((stat, index) => (
            <div key={index} className='text-center'>
              <div className='text-4xl lg:text-5xl font-bold text-primary-600 mb-2'>
                {stat.number}
              </div>
              <div className='text-muted-foreground font-medium'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className='grid md:grid-cols-2 gap-6'>
          {testimonials.map((testimonial, index) => (
            <div key={index} className='bg-card'>
              <div className='p-6'>
                <p className='text-muted-foreground mb-4 italic leading-relaxed'>
                  {testimonial.text}
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3'>
                    <span className='text-primary font-semibold'>
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className='font-semibold'>{testimonial.name}</div>
                    <div className='text-sm text-muted-foreground'>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
