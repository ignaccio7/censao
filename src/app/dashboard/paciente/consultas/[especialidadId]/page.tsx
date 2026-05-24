import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'
import { notFound, redirect } from 'next/navigation'
import Title from '@/app/components/ui/title'
import Link from 'next/link'
import ConsultationsList from './components/consultations-list'
import { IconChevronLeft } from '@/app/components/icons/icons'

export default async function EspecialidadConsultasPage({
  params
}: {
  params: Promise<{ especialidadId: string }>
}) {
  const { especialidadId } = await params
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: { persona_ci: true, personas: true }
  })

  if (!usuario?.persona_ci) return notFound()

  // Validar si existe la especialidad
  const especialidad = await prisma.especialidades.findUnique({
    where: { id: especialidadId }
  })

  if (!especialidad) return notFound()

  // Buscar todas las consultas RAÍZ de esta especialidad
  const consultasRaiz = await prisma.consultas.findMany({
    where: {
      ficha_origen: {
        paciente_id: usuario.persona_ci,
        disponibilidades: {
          doctores_especialidades: {
            especialidad_id: especialidadId
          }
        }
      },
      consulta_padre_id: null,
      eliminado_en: null
    },
    include: {
      citas: {
        where: { eliminado_en: null }
      },
      seguimientos: {
        where: { eliminado_en: null },
        include: {
          citas: {
            where: { eliminado_en: null }
          }
        }
      }
    },
    orderBy: {
      creado_en: 'desc'
    }
  })

  // Mapeamos para calcular el estado
  const consultasList = consultasRaiz.map(c => {
    // Calculamos si hay alguna cita en estado PENDIENTE o GENERADA
    const citasPropiasPendientes = c.citas.some(
      cita => cita.estado === 'PENDIENTE' || cita.estado === 'GENERADA'
    )

    const citasSeguimientosPendientes = c.seguimientos.some(seg =>
      seg.citas.some(
        cita => cita.estado === 'PENDIENTE' || cita.estado === 'GENERADA'
      )
    )

    const estadoCalculado =
      citasPropiasPendientes || citasSeguimientosPendientes
        ? 'ACTIVA'
        : 'CERRADA'

    return {
      id: c.id,
      motivo: c.motivo_consulta,
      fecha: c.creado_en,
      estado: estadoCalculado,
      especialidadId: especialidadId
    }
  })

  return (
    <main className='font-secondary pb-10'>
      <div className='mb-4'>
        <Link
          href='/dashboard/paciente/consultas'
          className='text-primary-600 hover:underline font-semibold flex items-center gap-1'
        >
          <span>
            {' '}
            <IconChevronLeft />{' '}
          </span>{' '}
          Volver a especialidades
        </Link>
      </div>
      <div className='mb-6'>
        <Title>Mis Consultas — {especialidad.nombre}</Title>
      </div>

      <ConsultationsList
        consultas={consultasList}
        especialidadNombre={especialidad.nombre}
      />
    </main>
  )
}
