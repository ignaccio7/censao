import { IconPencil } from '@/app/components/icons/icons'
import CustomDataTable from '@/app/components/ui/dataTable'
import { DoctoresService } from '@/services/doctores'
import Link from 'next/link'

interface DoctoresTableProps {
  search?: string
  page?: number
  numberPerPage?: number
  estado?: string
  especialidad?: string
}

export default async function DoctoresTable({
  search,
  page = 1,
  numberPerPage = 10,
  estado,
  especialidad
}: DoctoresTableProps) {
  const doctores = await DoctoresService.getAllDoctores({
    search,
    page,
    numberPerPage,
    estado,
    especialidad
  })

  console.log(doctores)

  const columnas = [
    { campo: 'CI' },
    { campo: 'Nombre completo' },
    { campo: 'Matrícula' },
    { campo: 'Especialidades' },
    { campo: 'Estado' },
    { campo: 'Acciones' }
  ]

  const contenidoTabla =
    doctores?.map(doctor => {
      const nombreCompleto = [
        doctor.personas.nombres,
        doctor.personas.paterno ?? '',
        doctor.personas.materno ?? ''
      ]
        .filter(Boolean)
        .join(' ')

      const tieneEspecialidades = doctor.doctores_especialidades.length > 0

      return [
        // CI
        <span key={`ci-${doctor.doctor_id}`}>{doctor.personas.ci}</span>,

        // Nombre completo
        <span key={`nombre-${doctor.doctor_id}`}>{nombreCompleto}</span>,

        // Matrícula
        <span key={`matricula-${doctor.doctor_id}`}>
          {doctor.matricula ? (
            doctor.matricula
          ) : (
            <span className='text-gray-400 italic'>No registrada</span>
          )}
        </span>,

        // Especialidades (badges)
        <div
          key={`especialidades-${doctor.doctor_id}`}
          className='flex flex-wrap gap-1'
        >
          {tieneEspecialidades ? (
            doctor.doctores_especialidades.map(de => (
              <span
                key={de.id}
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  de.especialidades.estado
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-400 line-through'
                }`}
                title={
                  de.especialidades.estado
                    ? de.especialidades.nombre
                    : `${de.especialidades.nombre} (inactiva)`
                }
              >
                {de.especialidades.nombre}
              </span>
            ))
          ) : (
            <span className='text-gray-400 italic text-xs'>
              Sin especialidades
            </span>
          )}
        </div>,

        // Estado de configuración
        <span key={`estado-${doctor.doctor_id}`}>
          {tieneEspecialidades ? (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
              Completo
            </span>
          ) : (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800'>
              Incompleto
            </span>
          )}
        </span>,

        // Acciones
        <div
          key={`acciones-${doctor.doctor_id}`}
          className='flex flex-row gap-2 items-center'
        >
          <Link
            href={`/dashboard/admin/doctores/${doctor.doctor_id}/editar`}
            title='Configurar doctor'
            className='px-2 py-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm font-medium shadow-sm cursor-pointer flex items-center gap-1'
          >
            <IconPencil />
            <span className='hidden lg:inline'>Configurar</span>
          </Link>
        </div>
      ]
    }) ?? []

  return (
    <CustomDataTable
      columnas={columnas}
      contenidoTabla={contenidoTabla}
      contenidoCuandoVacio={
        <div className='text-center py-8'>
          <p className='text-gray-500 text-sm'>
            No se encontraron doctores con los filtros aplicados.
          </p>
        </div>
      }
    />
  )
}
