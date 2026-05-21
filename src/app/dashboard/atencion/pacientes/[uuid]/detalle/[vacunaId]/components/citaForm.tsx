import { DayPicker } from 'react-day-picker'
import { es } from 'react-day-picker/locale'

const TIPOS_CITA = [
  { value: 'VACUNA', label: 'Vacuna (próxima dosis)' },
  { value: 'CONTROL', label: 'Control médico' },
  { value: 'CONSULTA', label: 'Consulta general' }
] as const

// ── Subcomponente: formulario de cita (reutilizado en editar y nueva cita) ────
export default function CitaForm({
  tipo,
  observaciones,
  fecha,
  onTipoChange,
  onObsChange,
  onFechaChange,
  onCancel,
  onSubmit,
  isPending,
  submitLabel,
  submitColor = 'bg-primary-600 hover:bg-primary-700',
  today
}: {
  tipo: 'VACUNA' | 'CONTROL' | 'CONSULTA'
  observaciones: string
  fecha: Date | undefined
  onTipoChange: (v: 'VACUNA' | 'CONTROL' | 'CONSULTA') => void
  onObsChange: (v: string) => void
  onFechaChange: (v: Date | undefined) => void
  onCancel: () => void
  onSubmit: () => void
  isPending: boolean
  submitLabel: string
  submitColor?: string
  today: Date
}) {
  return (
    <div className='space-y-4'>
      <div>
        <label
          className='block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide'
          htmlFor='tipo-de-cita'
        >
          Tipo de cita
        </label>
        <select
          value={tipo}
          onChange={e => onTipoChange(e.target.value as any)}
          className='w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-500'
        >
          {TIPOS_CITA.map(t => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor='fecha-de-cita'
          className='block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide'
        >
          Fecha (Lunes a Viernes)
        </label>
        <div className='flex justify-center bg-white border border-gray-200 rounded-lg p-1'>
          <DayPicker
            mode='single'
            selected={fecha}
            onSelect={onFechaChange}
            fromYear={new Date().getFullYear()}
            toYear={new Date().getFullYear() + 5}
            disabled={[{ dayOfWeek: [0, 6] }, { before: today }]}
            styles={{
              root: { '--rdp-accent-color': '#12977e' } as React.CSSProperties
            }}
            modifiersClassNames={{
              selected: 'bg-primary-500 text-white rounded-full',
              today: 'border-2 border-secondary-500 rounded-full'
            }}
            animate
            locale={es}
            captionLayout='dropdown'
          />
        </div>
        {fecha && (
          <p className='text-xs text-center text-primary-700 font-semibold mt-1'>
            ✓{' '}
            {fecha.toLocaleDateString('es-BO', {
              weekday: 'short',
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })}
          </p>
        )}
      </div>
      <div>
        <label
          className='block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide'
          htmlFor='observaciones'
        >
          Observaciones (opcional)
        </label>
        <input
          type='text'
          value={observaciones}
          onChange={e => onObsChange(e.target.value)}
          placeholder='Notas adicionales...'
          maxLength={500}
          className='w-full p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-primary-500'
        />
      </div>
      <div className='flex gap-3 pt-1'>
        <button
          onClick={onCancel}
          className='flex-1 py-2.5 border border-gray-300 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer'
        >
          Cancelar
        </button>
        <button
          onClick={onSubmit}
          disabled={isPending || !fecha}
          className={`flex-1 py-2.5 text-white rounded-lg text-sm font-semibold disabled:opacity-50 cursor-pointer transition-colors ${submitColor}`}
        >
          {isPending ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </div>
  )
}
