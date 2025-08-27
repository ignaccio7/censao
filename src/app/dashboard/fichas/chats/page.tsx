// oxlint-disable no-unused-vars
// oxlint-disable click-events-have-key-events
'use client'
import { useState } from 'react'
import {
  IconHospital,
  IconSendMessage,
  IconUser,
  IconClock,
  IconDotsVertical
} from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'

// Mock de chats con pacientes
const chatsDB = [
  {
    id: 1,
    paciente: 'Ana Rosa',
    ultimoMensaje: 'Gracias doctora, nos vemos mañana a las 10:00 AM',
    fecha: '2024-08-27',
    hora: '14:30',
    noLeidos: 0,
    estado: 'activo',
    mensajes: [
      { user: 'doctora', message: 'Hola Ana, ¿en qué puedo ayudarte?' },
      {
        user: 'paciente',
        message: 'Doctora, quisiera confirmar mi cita de mañana'
      },
      {
        user: 'doctora',
        message:
          'Por supuesto, tienes tu cita mañana a las 10:00 AM para consulta general'
      },
      {
        user: 'paciente',
        message: 'Perfecto, ¿debo llevar algún documento especial?'
      },
      {
        user: 'doctora',
        message: 'Solo tu cédula de identidad y el carnet del seguro si tienes'
      },
      {
        user: 'paciente',
        message: 'Gracias doctora, nos vemos mañana a las 10:00 AM'
      }
    ]
  },
  {
    id: 2,
    paciente: 'Jose Lopez',
    ultimoMensaje: '¿Puedo cambiar mi cita para el viernes?',
    fecha: '2024-08-27',
    hora: '12:15',
    noLeidos: 2,
    estado: 'pendiente',
    mensajes: [
      { user: 'doctora', message: 'Hola José, ¿cómo estás?' },
      { user: 'paciente', message: 'Bien doctora, tengo una consulta' },
      { user: 'paciente', message: '¿Puedo cambiar mi cita para el viernes?' }
    ]
  },
  {
    id: 3,
    paciente: 'Juan Perez',
    ultimoMensaje: 'Entendido, estaré ahí puntual',
    fecha: '2024-08-26',
    hora: '16:45',
    noLeidos: 0,
    estado: 'finalizado',
    mensajes: [
      { user: 'paciente', message: 'Doctora, ¿a qué hora es mi cita?' },
      { user: 'doctora', message: 'Tu cita es mañana a las 8:30 AM' },
      { user: 'paciente', message: 'Entendido, estaré ahí puntual' }
    ]
  },
  {
    id: 4,
    paciente: 'Maria Gonzalez',
    ultimoMensaje: 'Doctora, necesito reagendar mi cita urgente',
    fecha: '2024-08-27',
    hora: '09:20',
    noLeidos: 1,
    estado: 'urgente',
    mensajes: [
      {
        user: 'paciente',
        message: 'Doctora, necesito reagendar mi cita urgente'
      }
    ]
  }
]

export default function PageChats() {
  const [chats] = useState(chatsDB)
  const [chatActivo, setChatActivo] = useState(null)
  const [mensajes, setMensajes] = useState([])

  const handleChatClick = chat => {
    setChatActivo(chat)
    setMensajes(chat.mensajes)
  }

  const handleSubmit = message => {
    if (!message || !chatActivo) {
      return
    }

    setMensajes([...mensajes, { user: 'doctora', message: message.toString() }])
  }

  const getEstadoColor = estado => {
    switch (estado) {
      case 'urgente':
        return 'bg-red-100 border-red-300'
      case 'pendiente':
        return 'bg-yellow-100 border-yellow-300'
      case 'activo':
        return 'bg-blue-100 border-blue-300'
      case 'finalizado':
        return 'bg-gray-100 border-gray-300'
      default:
        return 'bg-white border-gray-300'
    }
  }

  const getEstadoText = estado => {
    switch (estado) {
      case 'urgente':
        return 'Urgente'
      case 'pendiente':
        return 'Pendiente'
      case 'activo':
        return 'Activo'
      case 'finalizado':
        return 'Finalizado'
      default:
        return 'Sin estado'
    }
  }

  return (
    <section className='chats h-[calc(var(--size-window)-2rem)] md:h-[calc(var(--size-window)-4rem)] font-secondary'>
      <Title
        subtitle='Listado de chats que se tuvo con los pacientes'
        className='mb-4'
      >
        Chats con los pacientes
      </Title>

      <div className='flex h-[calc(100%-5rem)] bg-white rounded-lg border border-gray-300 overflow-hidden'>
        {/* Lista de chats */}
        <div className='w-1/3 border-r border-gray-300 flex flex-col'>
          <div className='p-4 border-b border-gray-300 bg-gray-50'>
            <h3 className='font-semibold text-gray-700'>
              Conversaciones ({chats.length})
            </h3>
          </div>

          <div className='overflow-y-auto flex-1'>
            {chats.map(chat => (
              <div
                key={chat.id}
                onClick={() => handleChatClick(chat)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors duration-200 ${
                  chatActivo?.id === chat.id
                    ? 'bg-primary-50 border-primary-200'
                    : ''
                } ${getEstadoColor(chat.estado)}`}
              >
                <div className='flex justify-between items-start mb-1'>
                  <h4 className='font-semibold text-gray-800'>
                    {chat.paciente}
                  </h4>
                  <div className='flex items-center gap-1'>
                    {chat.noLeidos > 0 && (
                      <span className='bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center'>
                        {chat.noLeidos}
                      </span>
                    )}
                    <span className='text-xs text-gray-500'>{chat.hora}</span>
                  </div>
                </div>

                <p className='text-sm text-gray-600 truncate mb-2'>
                  {chat.ultimoMensaje}
                </p>

                <div className='flex justify-between items-center'>
                  <span className='text-xs text-gray-500 flex items-center gap-1'>
                    <IconClock size='12' />
                    {chat.fecha}
                  </span>
                  <span className='text-xs px-2 py-1 rounded-full bg-white border border-current flex items-center gap-1'>
                    <IconDotsVertical
                      size='8'
                      className={`
                      ${chat.estado === 'urgente' ? 'text-red-500' : ''}
                      ${chat.estado === 'pendiente' ? 'text-yellow-500' : ''}
                      ${chat.estado === 'activo' ? 'text-blue-500' : ''}
                      ${chat.estado === 'finalizado' ? 'text-gray-500' : ''}
                    `}
                    />
                    {getEstadoText(chat.estado)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Área de chat */}
        <div className='w-2/3 flex flex-col'>
          {chatActivo ? (
            <>
              {/* Header del chat */}
              <div className='p-4 border-b border-gray-300 bg-gray-50'>
                <div className='flex items-center gap-3'>
                  <div className='bg-primary-600 text-white w-10 h-10 rounded-full flex items-center justify-center'>
                    <IconUser size='20' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-800'>
                      {chatActivo.paciente}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      Estado: {getEstadoText(chatActivo.estado)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mensajes */}
              <div className='flex-1 overflow-y-auto p-4'>
                <div className='flex flex-col gap-3'>
                  {mensajes.map((mensaje, key) => {
                    const isDoctora = mensaje.user === 'doctora'
                    return (
                      <div
                        key={key}
                        className={`chat-message flex gap-2 ${isDoctora ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`text-white w-8 h-8 rounded-full flex items-center justify-center ${
                            isDoctora
                              ? 'order-2 bg-green-600'
                              : 'order-0 bg-blue-600'
                          }`}
                        >
                          {isDoctora ? (
                            <IconHospital size='16' />
                          ) : (
                            <IconUser size='16' />
                          )}
                        </div>
                        <div
                          className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg shadow-sm ${
                            isDoctora
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          <p className='text-sm'>{mensaje.message}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Input de mensaje */}
              <div className='p-4 border-t border-gray-300 bg-gray-50'>
                <div className='flex gap-2'>
                  <div className='flex-1 relative'>
                    <input
                      type='text'
                      placeholder='Escribe tu respuesta aquí...'
                      className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent'
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          const value = e.target.value.trim()
                          if (value && chatActivo) {
                            setMensajes([
                              ...mensajes,
                              { user: 'doctora', message: value }
                            ])
                            e.target.value = ''
                          }
                        }
                      }}
                    />
                  </div>
                  <button
                    onClick={e => {
                      const input = e.target
                        .closest('.flex')
                        .querySelector('input')
                      const value = input.value.trim()
                      if (value && chatActivo) {
                        setMensajes([
                          ...mensajes,
                          { user: 'doctora', message: value }
                        ])
                        input.value = ''
                      }
                    }}
                    className='bg-primary-700 text-white p-3 rounded-lg hover:bg-primary-800 transition-colors duration-200'
                  >
                    <IconSendMessage size='20' />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className='flex-1 flex items-center justify-center text-gray-500'>
              <div className='text-center'>
                <IconHospital
                  size='48'
                  className='mx-auto mb-4 text-gray-400'
                />
                <h3 className='text-lg font-semibold mb-2'>
                  Selecciona una conversación
                </h3>
                <p className='text-sm'>
                  Elige un chat de la lista para ver los mensajes
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
