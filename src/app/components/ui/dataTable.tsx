// oxlint-disable no-nested-ternary
import { ReactNode } from 'react'
import { ColumnaType } from '@/app/types'

export interface CustomDataTableType {
  titulo?: string
  subtitulo?: string
  error?: boolean
  cargando?: boolean
  acciones?: Array<ReactNode>
  columnas: Array<ColumnaType>
  filtros?: ReactNode
  contenidoTabla: Array<Array<ReactNode>>
  contenidoCuandoVacio?: ReactNode
  paginacion?: ReactNode
  numeracion?: boolean
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
  numeracion = false
}: CustomDataTableType) {
  // Verifica si una fila tiene "estado"
  const verificarEstado = (text: any[]) => {
    try {
      for (const campo of text) {
        if (campo?.key?.includes('estado')) return true
      }
      return false
    } catch {
      return false
    }
  }

  const obtenerColor = (text: any[]) => {
    for (const campo of text) {
      if (campo?.key?.includes('estado')) {
        if (campo.props?.color) return campo.props.color
        if (campo.props?.children?.props?.color)
          return campo.props.children.props.color
      }
    }
    return 'blue'
  }

  return (
    <div className='pb-4'>
      {/* Título y acciones */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center'>
        <div>
          {titulo && (
            <h2 className='text-xl font-semibold text-gray-800'>{titulo}</h2>
          )}
          {subtitulo && (
            <p className='text-sm text-gray-500 mt-1'>{subtitulo}</p>
          )}
        </div>
        <div className='flex gap-2 mt-2 sm:mt-0'>
          {acciones.map((accion, index) => (
            <div key={`accion-id-${index}`}>{accion}</div>
          ))}
        </div>
      </div>

      {/* Filtros */}
      {filtros && <div className='py-3'>{filtros}</div>}

      {/* Contenedor tabla */}
      <div className='overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow'>
        {cargando ? (
          <div className='p-6 text-center text-gray-500'>Cargando...</div>
        ) : error ? (
          <div className='p-6 text-center text-red-500'>
            Error obteniendo información
          </div>
        ) : contenidoTabla.length === 0 ? (
          <div className='p-6 text-center text-gray-500'>
            {contenidoCuandoVacio ?? 'Sin registros'}
          </div>
        ) : (
          <div>
            <table className='w-full border-collapse'>
              <thead className='bg-gray-100 dark:bg-gray-700'>
                <tr>
                  {numeracion && (
                    <th className='px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300'>
                      #
                    </th>
                  )}
                  {columnas.map((columna, index) => (
                    <th
                      key={`cabecera-id-${index}`}
                      className='px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300'
                    >
                      {columna.nombre}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contenidoTabla.map((fila, filaIndex) => (
                  <tr
                    key={`row-id-${filaIndex}`}
                    className={`${
                      filaIndex % 2 === 0
                        ? 'bg-white dark:bg-gray-800'
                        : 'bg-gray-50 dark:bg-gray-700'
                    } ${
                      verificarEstado(fila)
                        ? `border-l-4 border-${obtenerColor(fila)}-500`
                        : ''
                    }`}
                  >
                    {numeracion && (
                      <td className='px-3 py-2 text-sm text-gray-700 dark:text-gray-200'>
                        {filaIndex + 1}
                      </td>
                    )}
                    {fila.map((contenido, celdaIndex) => (
                      <td
                        key={`celda-id-${filaIndex}-${celdaIndex}`}
                        className='px-3 py-2 text-sm text-gray-700 dark:text-gray-200'
                      >
                        {contenido}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {paginacion && <div className='p-3'>{paginacion}</div>}
          </div>
        )}
      </div>
    </div>
  )
}
