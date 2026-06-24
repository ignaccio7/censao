import {
  IconCredential,
  IconEmail,
  IconUser
} from '@/app/components/icons/icons'

interface PacienteCardProps {
  paciente: {
    paciente_id: string
    nro_historia_clinica?: string | null
    fecha_nacimiento?: Date | string | null
    personas: {
      nombres: string
      paterno: string | null
      materno: string | null
      ci: string
      telefono: string | null
      correo: string | null
    }
    sexo: string | null
    grupo_sanguineo: string | null
  }
}

export default function PacienteCard({ paciente }: PacienteCardProps) {
  const {
    personas,
    sexo,
    grupo_sanguineo,
    fecha_nacimiento,
    nro_historia_clinica
  } = paciente

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
      <div className='bg-linear-to-r from-primary-600 to-primary-800 p-5 text-white'>
        <h2 className='text-xl font-bold flex items-center gap-2'>
          <IconUser size='28' /> {personas.nombres} {personas.paterno}{' '}
          {personas.materno || ''}
        </h2>
      </div>

      <div className='p-5 space-y-4 text-sm grid grid-cols-1 lg:grid-cols-2'>
        <div className='flex items-center gap-3'>
          <div className='bg-gray-100 p-2 rounded-lg text-gray-500 shrink-0'>
            <IconCredential size='18' />
          </div>
          <div>
            <p className='text-xs text-gray-400 font-semibold uppercase'>
              CI / Documento
            </p>
            <p className='font-medium text-gray-800'>{personas.ci}</p>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='bg-gray-100 p-2 rounded-lg text-gray-500 shrink-0'>
            📱
          </div>
          <div>
            <p className='text-xs text-gray-400 font-semibold uppercase'>
              Teléfono
            </p>
            <p className='font-medium text-gray-800'>
              {personas.telefono || 'No registrado'}
            </p>
          </div>
        </div>

        <div className='flex items-center gap-3 lg:col-span-2'>
          <div className='bg-gray-100 p-2 rounded-lg text-gray-500 shrink-0'>
            <IconEmail size='18' />
          </div>
          <div className='overflow-hidden'>
            <p className='text-xs text-gray-400 font-semibold uppercase'>
              Correo
            </p>
            <p
              className='font-medium text-gray-800 truncate'
              title={personas.correo || ''}
            >
              {personas.correo || 'No registrado'}
            </p>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 lg:col-span-2'>
          <div>
            <p className='text-xs text-gray-400 font-semibold uppercase'>
              Sexo
            </p>
            <p className='font-medium text-gray-800'>
              {sexo === 'M'
                ? 'Masculino'
                : sexo === 'F'
                  ? 'Femenino'
                  : sexo === 'O'
                    ? 'Otro'
                    : 'N/R'}
            </p>
          </div>
          <div>
            <p className='text-xs text-gray-400 font-semibold uppercase'>
              Sangre
            </p>
            <p className='font-medium text-gray-800'>
              {grupo_sanguineo || 'N/R'}
            </p>
          </div>
          {fecha_nacimiento && (
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Fecha Nacimiento
              </p>
              <p className='font-medium text-gray-800'>
                {new Date(fecha_nacimiento).toLocaleDateString('es-BO', {
                  timeZone: 'UTC',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}
              </p>
            </div>
          )}
          {nro_historia_clinica && (
            <div>
              <p className='text-xs text-gray-400 font-semibold uppercase'>
                Nro. Historia Clínica
              </p>
              <p className='font-medium text-gray-800'>
                {nro_historia_clinica}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
