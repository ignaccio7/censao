import { auth } from '@/auth'
import prisma from '@/lib/prisma/prisma'
import { redirect } from 'next/navigation'
import PatientConsultations from './components/patient-consultations'

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

  // Obtener todas las consultas del paciente para extraer especialidades
  const consultasDB = await prisma.consultas.findMany({
    where: {
      ficha_origen: {
        paciente_id: usuario.persona_ci
      },
      consulta_padre_id: null, // Solo consultas raíz
      eliminado_en: null
    },
    include: {
      ficha_origen: {
        include: {
          disponibilidades: {
            include: {
              doctores_especialidades: {
                include: {
                  especialidades: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      creado_en: 'desc'
    }
  })

  // Agrupamos por especialidad_id
  const especialidadesMap = new Map()

  for (const c of consultasDB) {
    const especialidad =
      c.ficha_origen?.disponibilidades?.doctores_especialidades?.especialidades
    if (!especialidad) continue

    const espId = especialidad.id
    if (!especialidadesMap.has(espId)) {
      especialidadesMap.set(espId, {
        id: espId,
        nombre: especialidad.nombre,
        totalConsultas: 1,
        ultimaConsulta: c.creado_en
      })
    } else {
      const actual = especialidadesMap.get(espId)
      actual.totalConsultas += 1
      // Como vienen ordenadas por desc, la primera que entra es la más reciente
      especialidadesMap.set(espId, actual)
    }
  }

  const especialidades = Array.from(especialidadesMap.values())

  return (
    <main>
      <PatientConsultations especialidades={especialidades} />
    </main>
  )
}
