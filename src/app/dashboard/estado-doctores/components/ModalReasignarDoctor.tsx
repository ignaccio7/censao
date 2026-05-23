'use client'
import { useState } from 'react'
import {
  type DoctorTurno,
  type FichaEstado,
  useReasignarDoctor
} from '@/app/services/estado-doctores'
import { toast } from 'sonner'
import Modal from '@/app/components/ui/modal/modal'

const ESTADOS_LABEL: Record<string, string> = {
  EN_ESPERA: 'En espera',
  ATENDIENDO: 'Atendiendo',
  CANCELADA: 'Cancelada'
}

const ESTADO_BADGE: Record<string, string> = {
  EN_ESPERA: 'bg-blue-100 text-blue-700',
  ATENDIENDO: 'bg-purple-100 text-purple-700',
  CANCELADA: 'bg-red-100 text-red-700'
}

interface ModalReasignarProps {
  doctor: DoctorTurno
  todosLosDoctores: DoctorTurno[]
  isOpen: boolean
  onClose: () => void
}

function ModalReasignarDoctor({
  doctor,
  todosLosDoctores,
  isOpen,
  onClose
}: ModalReasignarProps) {
  const { reasignarDoctor } = useReasignarDoctor()
  const [doctorDestinoId, setDoctorDestinoId] = useState('')

  // Doctores de la misma especialidad (excluye al origen)
  const doctoresDestino = todosLosDoctores.filter(
    d =>
      d.especialidadId === doctor.especialidadId &&
      d.doctorId !== doctor.doctorId
  )

  const handleConfirmar = async () => {
    if (!doctorDestinoId) {
      toast.error('Selecciona un doctor destino')
      return
    }

    try {
      const result = await reasignarDoctor.mutateAsync({
        doctorOrigenId: doctor.doctorId,
        especialidadId: doctor.especialidadId,
        doctorDestinoId
      })

      if (result.success) {
        toast.success(result.message || 'Fichas reasignadas exitosamente')
        onClose()
      } else {
        toast.error(result.message || 'Error al reasignar fichas')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al reasignar fichas')
    }
  }

  const handleClose = () => {
    setDoctorDestinoId('')
    onClose()
  }

  return (
    <Modal
      title={`Reasignar fichas — ${doctor.nombre}`}
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth='xl'
    >
      <div className='flex flex-col gap-4'>
        <p className='text-sm text-gray-600'>
          <span className='font-medium'>{doctor.especialidadNombre}</span> ·{' '}
          {doctor.fichasActivas.length} ficha(s) se moverán al nuevo doctor como{' '}
          <span className='font-semibold text-blue-700'>En Espera</span>.
        </p>

        {/* Lista de fichas que se reasignarán */}
        {doctor.fichasActivas.length > 0 ? (
          <div className='max-h-48 overflow-y-auto rounded-md border border-gray-200'>
            <table className='w-full text-sm'>
              <thead className='bg-gray-50 text-gray-500 text-xs uppercase'>
                <tr>
                  <th className='px-3 py-2 text-left'># Ficha</th>
                  <th className='px-3 py-2 text-left'>Paciente</th>
                  <th className='px-3 py-2 text-left'>Estado actual</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {doctor.fichasActivas
                  .sort((a, b) => (a.orden_turno || 0) - (b.orden_turno || 0))
                  .map((ficha: FichaEstado) => {
                    const persona = ficha.pacientes.personas
                    const nombre =
                      `${persona.nombres} ${persona.paterno || ''} ${persona.materno || ''}`.trim()
                    return (
                      <tr key={ficha.id} className='hover:bg-gray-50'>
                        <td className='px-3 py-2 font-semibold text-primary-700'>
                          #{ficha.orden_turno}
                        </td>
                        <td className='px-3 py-2 text-gray-800'>{nombre}</td>
                        <td className='px-3 py-2'>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${ESTADO_BADGE[ficha.estado] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {ESTADOS_LABEL[ficha.estado] || ficha.estado}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className='text-sm text-gray-500 italic'>
            No hay fichas activas para reasignar.
          </p>
        )}

        {/* Selección del doctor destino */}
        <label className='flex flex-col gap-1 text-sm font-medium text-gray-700'>
          Doctor destino
          <select
            value={doctorDestinoId}
            onChange={e => setDoctorDestinoId(e.target.value)}
            className='p-2 border rounded-md focus:outline-none focus:ring-1 focus:border-primary-600 focus:ring-primary-600 disabled:bg-gray-100 disabled:cursor-not-allowed border-gray-300'
            disabled={doctoresDestino.length === 0}
          >
            <option value=''>
              {doctoresDestino.length === 0
                ? 'No hay otros doctores disponibles en esta especialidad'
                : 'Selecciona un doctor destino'}
            </option>
            {doctoresDestino.map(d => (
              <option key={d.doctorId} value={d.doctorId}>
                {d.nombre}
              </option>
            ))}
          </select>
        </label>

        {/* Botones */}
        <div className='flex gap-3 justify-end mt-2'>
          <button
            onClick={handleClose}
            className='px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm cursor-pointer'
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={
              !doctorDestinoId ||
              reasignarDoctor.isPending ||
              doctor.fichasActivas.length === 0
            }
            className='px-4 py-2 rounded-md bg-primary-700 text-white hover:bg-primary-800 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2'
          >
            {reasignarDoctor.isPending ? (
              <>
                <div className='animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full' />
                Reasignando...
              </>
            ) : (
              'Confirmar reasignación'
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

export default ModalReasignarDoctor
