'use client'

import Title from '@/app/components/ui/title'
import { useState } from 'react'

export default function DoctorTreatments() {
  const [formData, setFormData] = useState({
    pacienteId: '',
    tipoVacuna: '',
    dosis: '',
    observaciones: ''
  })

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para enviar el formulario
    console.log('Registrando seguimiento:', formData)
    alert('Seguimiento registrado con éxito (Simulado)')
    setFormData({
      pacienteId: '',
      tipoVacuna: '',
      dosis: '',
      observaciones: ''
    })
  }

  return (
    <section className='doctor-treatments font-secondary'>
      <Title>Registrar Seguimiento de Vacuna</Title>

      <div className='bg-white p-6 rounded-md shadow-sm mt-6 max-w-2xl'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='flex flex-col gap-2'>
            <label htmlFor='pacienteId' className='font-semibold text-gray-700'>
              Paciente
            </label>
            <input
              type='text'
              id='pacienteId'
              name='pacienteId'
              value={formData.pacienteId}
              onChange={handleChange}
              placeholder='Buscar o ingresar ID del paciente'
              className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500'
              required
            />
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='tipoVacuna' className='font-semibold text-gray-700'>
              Tipo de Vacuna
            </label>
            <select
              id='tipoVacuna'
              name='tipoVacuna'
              value={formData.tipoVacuna}
              onChange={handleChange}
              className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'
              required
            >
              <option value=''>Seleccione una vacuna...</option>
              <option value='COVID-19'>COVID-19</option>
              <option value='Influenza'>Influenza Estacional</option>
              <option value='Hepatitis B'>Hepatitis B</option>
              <option value='Tetanos'>Tétanos</option>
              <option value='Fiebre Amarilla'>Fiebre Amarilla</option>
            </select>
          </div>

          <div className='flex flex-col gap-2'>
            <label htmlFor='dosis' className='font-semibold text-gray-700'>
              Dosis Aplicada
            </label>
            <select
              id='dosis'
              name='dosis'
              value={formData.dosis}
              onChange={handleChange}
              className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white'
              required
            >
              <option value=''>Seleccione la dosis...</option>
              <option value='Primera'>Primera Dosis</option>
              <option value='Segunda'>Segunda Dosis</option>
              <option value='Tercera'>Tercera Dosis (Refuerzo)</option>
              <option value='Anual'>Dosis Anual</option>
            </select>
          </div>

          <div className='flex flex-col gap-2'>
            <label
              htmlFor='observaciones'
              className='font-semibold text-gray-700'
            >
              Observaciones
            </label>
            <textarea
              id='observaciones'
              name='observaciones'
              value={formData.observaciones}
              onChange={handleChange}
              placeholder='Reacciones adversas, notas adicionales...'
              className='p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none'
              rows={4}
            />
          </div>

          <button
            type='submit'
            className='mt-4 bg-primary-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-primary-700 transition-colors duration-300'
          >
            Registrar Seguimiento
          </button>
        </form>
      </div>
    </section>
  )
}
