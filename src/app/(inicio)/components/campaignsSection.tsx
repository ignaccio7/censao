// oxlint-disable sort-keys
const campaigns = [
  {
    title: 'Vacunación COVID-19',
    description:
      'Refuerzos disponibles para todas las edades. Protege a tu familia con las últimas vacunas aprobadas.',
    icon: '🛡️',
    status: 'Activa',
    date: 'Disponible todo el año'
  },
  {
    title: 'Campaña de Influenza',
    description:
      'Vacunación anual contra la gripe estacional. Especialmente recomendada para adultos mayores.',
    icon: '🌡️',
    status: 'Próximamente',
    date: 'Marzo - Mayo 2025'
  },
  {
    title: 'Vacunas Infantiles',
    description:
      'Esquema completo de vacunación para niños según calendario oficial. Consulta gratuita incluida.',
    icon: '👶',
    status: 'Activa',
    date: 'Permanente'
  },
  {
    title: 'Vacunación COVID-19',
    description:
      'Refuerzos disponibles para todas las edades. Protege a tu familia con las últimas vacunas aprobadas.',
    icon: '🛡️',
    status: 'Activa',
    date: 'Disponible todo el año'
  },
  {
    title: 'Vacunación COVID-19',
    description:
      'Refuerzos disponibles para todas las edades. Protege a tu familia con las últimas vacunas aprobadas.',
    icon: '🛡️',
    status: 'Activa',
    date: 'Disponible todo el año'
  }
]

export default function CampaignsSection() {
  return (
    <section className='py-16 bg-muted/30'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-3xl lg:text-4xl font-bold mb-4'>
            Campañas de Vacunación Actuales
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            Mantente informado sobre nuestras campañas activas y próximas. Cada
            vacuna es administrada por personal médico certificado.
          </p>
        </div>

        <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {campaigns.map((campaign, index) => (
            <div
              key={index}
              className='hover:shadow-lg transition-shadow bg-white p-4 rounded-lg'
            >
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-3xl'>{campaign.icon}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'Activa'
                        ? 'bg-primary-700/10 text-primary-600'
                        : 'bg-amber-700/10 text-amber-400'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <div className='text-xl'>{campaign.title}</div>
                <div className='text-sm text-muted-foreground'>
                  {campaign.date}
                </div>
              </div>
              <div>
                <p className='text-muted-foreground mb-4 leading-relaxed'>
                  {campaign.description}
                </p>
                <button className='w-full bg-transparent'>
                  Más Información
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
