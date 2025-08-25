'use client'
// oxlint-disable label-has-associated-control
import {
  IconHospital,
  IconSendMessage,
  IconUser
} from '@/app/components/icons/icons'
import Title from '@/app/components/ui/title'
import { useState } from 'react'

const messagesDB = [
  {
    user: 'censao',
    message: 'En que puedo ayudarte?'
  }
  // {
  //   user: 'jose',
  //   message:
  //     'Hola, quisiera reconfirmar la cita que tengo para el dia de mañana'
  // }
]

export default function Page() {
  const [messages, setMessages] = useState(messagesDB)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const message = formData.get('message')

    if (!message) {
      return
    }

    setMessages([...messages, { user: 'jose', message: message.toString() }])
    event.currentTarget.reset()
  }

  return (
    <section className='chat-system w-full h-[calc(var(--size-window)-2rem)] md:h-[calc(var(--size-window)-4rem)] font-secondary bg-white-100 flex flex-col'>
      <Title className='pb-4'>Chat personal</Title>
      <div className='chat-container grow overflow-y-auto bg-white rounded-tr-lg rounded-tl-lg flex flex-col border border-gray-300 border-b-0 p-4'>
        <div className='chat-content grow'>
          <div className='frequent-questions flex flex-col gap-1 mb-2 sticky top-0 bg-white z-10'>
            <h3 className='text-gray-500 font-semibold'>
              Preguntas frecuentes
            </h3>
            <button className='text-step-1 p-1 border border-dashed border-gray-400 w-full rounded-lg text-start'>
              Cuales son los horarios de atencion?
            </button>
            <button className='text-step-1 p-1 border border-dashed border-gray-400 w-full rounded-lg text-start'>
              Que especialidades tenemos en el centro de salud?
            </button>
            <button className='text-step-1 p-1 border border-dashed border-gray-400 w-full rounded-lg text-start'>
              Ubicacion del centro?
            </button>
          </div>
          <div className='chats flex flex-col gap-2'>
            {messages.map((message, key) => {
              const isUser = message.user !== 'censao'
              return (
                <div
                  className={`chat-message flex gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}
                  key={key}
                >
                  <div
                    className={`image text-white w-fit p-2 rounded-full ${isUser ? 'order-2' : 'order-0'} ${isUser ? 'bg-amber-500' : 'bg-green-700'}`}
                  >
                    {isUser ? <IconUser /> : <IconHospital />}
                  </div>
                  <p className='h-full bg-white shadow-xl p-2'>
                    {message.message}
                  </p>
                </div>
              )
            })}
            {/* <div className='chat-message hospital flex gap-1 justify-start'>
              <div className='image-hospital bg-green-700 text-white w-fit p-2 rounded-full'>
                <IconHospital />
              </div>
              <p className='h-full bg-white shadow-xl p-2'>
                Algo nuevo que preguntar?
              </p>
            </div>

            <div className='chat-message user flex gap-1 justify-end'>
              <div className='image-hospital bg-amber-500 text-white w-fit p-2 rounded-full order-2'>
                <IconUser />
              </div>
              <p className='h-full bg-white shadow-xl p-2'>
                Algo nuevo que preguntar?
              </p>
            </div> */}
          </div>
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className='w-full h-auto gap-2 flex flex-row p-4 bg-white border border-gray-300 border-t-1 rounded-bl-lg rounded-br-lg'
      >
        <label className='grow p-2 border border-gray-400 rounded-lg'>
          <input
            type='text'
            id='message'
            name='message'
            placeholder='Escribe tu mensaje aquí...'
            className='w-full border-none outline-0'
          />
        </label>
        <button className='bg-gray-800 text-white rounded-full p-2 cursor-pointer'>
          <IconSendMessage size='28' className='aspect-square' />
        </button>
      </form>
    </section>
  )
}
