import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'
import { redirect } from 'next/navigation'
import PatientTreatments from './dashboard/patient-treatments'

export default async function Page() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/api/auth/signin')
  }

  const usuario = await prisma.usuarios.findUnique({
    where: { usuario_id: session.user.id },
    select: { persona_ci: true }
  })

  if (!usuario?.persona_ci) {
    return (
      <main className='font-secondary p-4'>
        <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
          <p className='text-red-600 font-bold'>
            Error: Usuario sin perfil de paciente.
          </p>
        </div>
      </main>
    )
  }

  const tratamientosDB = await prisma.tratamientos.findMany({
    where: {
      ficha_origen: {
        paciente_id: usuario.persona_ci
      },
      eliminado_en: null
    },
    select: {
      estado: true,
      fecha_aplicacion: true,
      esquema_dosis: {
        select: {
          vacuna_id: true,
          vacunas: {
            select: {
              nombre: true
            }
          }
        }
      }
    },
    orderBy: {
      fecha_aplicacion: 'desc'
    }
  })

  // Agrupamos por vacuna_id para evitar múltiples filas de la misma vacuna
  const tratamientosUnicos = new Map()

  for (const t of tratamientosDB) {
    const vId = t.esquema_dosis.vacuna_id
    // Guardar el primero que encontramos (que será el más reciente debido al orderBy desc)
    if (!tratamientosUnicos.has(vId)) {
      tratamientosUnicos.set(vId, {
        id: vId,
        nombre: t.esquema_dosis.vacunas.nombre,
        estado: t.estado
      })
    }
  }

  const treatments = Array.from(tratamientosUnicos.values())

  return (
    <main>
      <PatientTreatments treatments={treatments} />
    </main>
  )
}
