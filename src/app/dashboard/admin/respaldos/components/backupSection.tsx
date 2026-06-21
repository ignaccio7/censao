'use client'

import { IconDownload, IconSpin } from '@/app/components/icons/icons'
import { useRespaldos } from '@/app/services/respaldos'

// ─── BackupSection ────────────────────────────────────────────────────────────
// Sección para generar y descargar el respaldo de la base de datos.
export default function BackupSection() {
  const { generarRespaldo } = useRespaldos()

  return (
    <div className='bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-4 max-w-3xl'>
      <div className='flex items-start gap-3'>
        <div className='w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0'>
          <IconDownload className='text-primary-600' />
        </div>
        <div>
          <h2 className='text-xl font-bold text-gray-800'>
            Generar y Descargar Respaldo
          </h2>
          <p className='text-gray-500 text-sm mt-0.5'>
            Exporta toda la base de datos como un archivo JSON.
          </p>
        </div>
      </div>

      <p className='text-gray-600 text-step-0'>
        Esta acción generará un archivo <strong>JSON</strong> con toda la
        información del sistema: usuarios, pacientes, doctores, fichas,
        consultas, vacunas, citas y demás datos. El archivo se descargará
        directamente en su computadora y{' '}
        <strong>no se almacenará en el servidor</strong>.
      </p>

      <p className='text-gray-600 text-step-0'>
        Se recomienda generar un respaldo antes de realizar cambios importantes
        o de forma periódica como medida de precaución.
      </p>

      <div className='actions mt-2'>
        <button
          id='btn-generar-respaldo'
          onClick={() => generarRespaldo.mutate()}
          disabled={generarRespaldo.isPending}
          className={`flex gap-2 items-center border-2 py-2 px-4 text-step-1 rounded-lg transition-colors duration-200 cursor-pointer ${
            generarRespaldo.isPending
              ? 'border-primary-400 bg-primary-50 text-primary-500 cursor-not-allowed opacity-70'
              : 'border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white'
          }`}
        >
          {generarRespaldo.isPending ? (
            <>
              <IconSpin className='animate-spin' />
              Generando respaldo...
            </>
          ) : (
            <>
              <IconDownload />
              Generar y descargar respaldo
            </>
          )}
        </button>
      </div>
    </div>
  )
}
