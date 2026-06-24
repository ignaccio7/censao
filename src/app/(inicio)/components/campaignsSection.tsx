// oxlint-disable sort-keys
const campaigns = [
  {
    title: 'Vacunas Infantiles',
    description:
      'Información general sobre el calendario de vacunación infantil, sus beneficios y recomendaciones de prevención para la salud de los niños.',
    icon: '👶'
  },
  {
    title: 'Prevención con Vacunas',
    description:
      'Consejos generales sobre la importancia de las vacunas preventivas y cómo ayudan a reducir el riesgo de enfermedades comunes.',
    icon: '🛡️'
  },
  {
    title: 'Tratamientos y Refuerzos',
    description:
      'Explicación general de cuándo se recomiendan refuerzos y cómo funcionan las vacunas como parte de un tratamiento preventivo.',
    icon: '💉'
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
            <div key={index} className='bg-white p-4 rounded-lg'>
              <div className='mb-4'>
                <span className='text-3xl'>{campaign.icon}</span>
              </div>
              <div className='text-xl mb-2 font-bold'>{campaign.title}</div>
              <p className='text-muted-foreground leading-relaxed'>
                {campaign.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
