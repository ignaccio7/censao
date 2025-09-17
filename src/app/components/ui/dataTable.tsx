// oxlint-disable no-magic-numbers
// oxlint-disable group-exports
// oxlint-disable no-nested-ternary
import { ReactNode } from 'react'

export interface ColumnaType {
  campo: string
}

export interface CustomDataTableType {
  titulo?: string
  subtitulo?: string
  error?: boolean
  cargando?: boolean
  acciones?: ReactNode[]
  columnas: ColumnaType[]
  filtros?: ReactNode
  contenidoTabla: ReactNode[][]
  contenidoCuandoVacio?: ReactNode
  paginacion?: ReactNode
  numeracion?: boolean
  // Nueva prop opcional para estilos de fila personalizados
  estilosPersonalizadosFila?: (filaIndex: number, fila: ReactNode[]) => string
}

export default function CustomDataTable({
  titulo,
  subtitulo,
  error = false,
  cargando = false,
  acciones = [],
  columnas,
  filtros,
  contenidoTabla,
  contenidoCuandoVacio,
  paginacion,
  numeracion = false,
  estilosPersonalizadosFila
}: CustomDataTableType) {
  const obtenerEstilosFila = (filaIndex: number, fila: ReactNode[]) => {
    const estilosBase = filaIndex % 2 === 0 ? 'bg-white-100' : 'bg-gray-200'

    const estilosPersonalizados = estilosPersonalizadosFila
      ? estilosPersonalizadosFila(filaIndex, fila)
      : ''

    return `${estilosBase} ${estilosPersonalizados}`.trim()
  }

  return (
    <div className='pb-4'>
      {/* Título y acciones */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4'>
        <div>
          {titulo && (
            <h2 className='text-xl font-semibold text-gray-800'>{titulo}</h2>
          )}
          {subtitulo && (
            <p className='text-sm text-gray-500 mt-1'>{subtitulo}</p>
          )}
        </div>
        {acciones.length > 0 && (
          <div className='flex gap-2 mt-2 sm:mt-0 flex-wrap'>
            {acciones.map((accion, index) => (
              <div key={`accion-${index}`}>{accion}</div>
            ))}
          </div>
        )}
      </div>

      {/* Filtros */}
      {filtros && <div className='mb-4 w-full'>{filtros}</div>}

      {/* Contenedor principal */}
      <div className='shadow-sm border border-gray-200'>
        {cargando ? (
          <div className='p-8 text-center text-gray-500'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2' />
            Cargando...
          </div>
        ) : error ? (
          <div className='p-8 text-center text-red-500 dark:text-red-400'>
            <div className='mb-2'>⚠️</div>
            Error obteniendo información
          </div>
        ) : contenidoTabla.length === 0 ? (
          <div className='p-8 text-center text-gray-700'>
            {contenidoCuandoVacio ?? 'Sin registros'}
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className='hidden md:block overflow-x-auto'>
              <table className='w-full rounded-lg overflow-hidden'>
                <thead className='bg-primary-700 border-b border-gray-200 '>
                  <tr>
                    {numeracion && (
                      <th className='px-6 py-3 text-left text-xs font-semibold text-secondary-300 uppercase tracking-wider'>
                        Nro
                      </th>
                    )}
                    {columnas.map((columna, index) => (
                      <th
                        key={`header-${index}`}
                        className='px-6 py-3 text-left text-xs text-secondary-300 font-semibold uppercase tracking-wider'
                      >
                        {columna.campo}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {contenidoTabla.map((fila, filaIndex) => (
                    <tr
                      key={`row-${filaIndex}`}
                      className={`${obtenerEstilosFila(filaIndex, fila)}`}
                    >
                      {numeracion && (
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold'>
                          {filaIndex + 1}
                        </td>
                      )}
                      {fila.map((contenido, celdaIndex) => (
                        <td
                          key={`cell-${filaIndex}-${celdaIndex}`}
                          className='px-6 py-4 text-sm text-gray-90'
                        >
                          {contenido}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de lista para móvil */}
            <div className='block md:hidden'>
              {contenidoTabla.map((fila, filaIndex) => (
                <div
                  key={`mobile-row-${filaIndex}`}
                  className={`p-4 border-b border-gray-200  last:border-b-0 ${obtenerEstilosFila(filaIndex, fila)}`}
                >
                  {numeracion && (
                    <div className='flex justify-between items-center mb-3'>
                      <span className='text-xs font-semibold text-secondary-800 uppercase tracking-wider'>
                        Registro
                      </span>
                      <span className='text-sm font-semibold text-gray-800 '>
                        #{filaIndex + 1}
                      </span>
                    </div>
                  )}
                  <div className='space-y-3'>
                    {fila.map((contenido, celdaIndex) => (
                      <div
                        key={`mobile-cell-${filaIndex}-${celdaIndex}`}
                        className='flex flex-col'
                      >
                        <span className='text-xs font-semibold text-secondary-800 uppercase tracking-wider mb-1'>
                          {columnas[celdaIndex]?.campo ||
                            `Campo ${celdaIndex + 1}`}
                        </span>
                        <span className='text-sm text-gray-900 '>
                          {contenido}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {paginacion && (
              <div className='w-full px-6 py-3 border-t border-gray-200'>
                {paginacion}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
