import prisma from '@/lib/prisma/prisma'
import TurnoCard from './turnoCard'

export default async function TurnosTable() {
  const turnos = await prisma.turnos_catalogo.findMany({
    where: { eliminado_en: null },
    orderBy: { hora_inicio: 'asc' }
  })

  if (turnos.length === 0) {
    return (
      <div className='p-12 text-center border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm'>
        No hay turnos configurados aún.
      </div>
    )
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
      {turnos.map(turno => (
        <TurnoCard
          key={turno.codigo}
          turno={{
            codigo: turno.codigo,
            nombre: turno.nombre,
            // hora_inicio y hora_fin son DateTime con solo la parte Time
            // los serializamos a string "HH:MM" para el client component
            hora_inicio: turno.hora_inicio.toISOString(),
            hora_fin: turno.hora_fin.toISOString()
          }}
        />
      ))}
    </div>
  )
}
