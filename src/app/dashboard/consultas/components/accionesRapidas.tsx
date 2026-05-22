'use client'

import {
  IconUserPlus,
  IconCheckupList,
  IconCheck
} from '@/app/components/icons/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFichas } from '@/app/services/fichas'
import { StateRecord, StateRecordType } from '@/lib/constants'
import { toast } from 'sonner'

interface AccionesRapidasProps {
  fichaId: string
  estadoFicha: StateRecordType
}

export default function AccionesRapidas({
  fichaId,
  estadoFicha
}: AccionesRapidasProps) {
  const router = useRouter()
  const { updateFicha } = useFichas()

  const handleMarcarAtendida = async () => {
    try {
      await updateFicha.mutateAsync({
        id: fichaId,
        status: StateRecord.ATENDIDA
      })
      toast.success('Ficha marcada como atendida exitosamente.')
      router.push('/dashboard/fichas')
    } catch (error) {
      console.log(error)
      toast.error('Error al marcar la ficha como atendida.')
    }
  }

  return (
    <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6'>
      <h3 className='text-lg font-bold text-gray-800 mb-4 flex items-center gap-2'>
        <IconUserPlus className='text-sky-600' size='20' />
        Acciones Rápidas
      </h3>

      <div className='flex flex-col gap-3'>
        <Link
          href={`/dashboard/consultas/${fichaId}/crear`}
          className='w-full py-3 px-4 bg-sky-600 text-white rounded-xl hover:bg-sky-700 transition-colors font-semibold shadow-sm flex items-center justify-center gap-2'
        >
          <IconCheckupList size='20' />
          Nueva Consulta
        </Link>

        {estadoFicha === StateRecord.ATENDIENDO && (
          <button
            onClick={handleMarcarAtendida}
            disabled={updateFicha.isPending}
            className='w-full py-3 px-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 hover:border-emerald-300 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer'
          >
            {updateFicha.isPending ? (
              'Marcando...'
            ) : (
              <>
                <IconCheck size='20' />
                Marcar Ficha ATENDIDA
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
