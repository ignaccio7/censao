// oxlint-disable click-events-have-key-events
'use client'

import { useEffect, useRef } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children?: React.ReactNode
  className?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  fullScreen?: boolean
  disableBackdropClick?: boolean
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  maxWidth = 'md',
  disableBackdropClick = false
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }

  // Manejar apertura/cierre del modal
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) {
      return
    }

    if (isOpen) {
      dialog.showModal()
      document.body.style.overflow = 'hidden'
      // Agregar clase para animación de entrada
      dialog.classList.add('modal-dialog')
      dialog.classList.remove('hide')
    } else if (dialog.open) {
      // Agregar clase hide para animación de salida
      dialog.classList.add('hide')

      // Esperar a que termine la animación antes de cerrar
      const handleAnimationEnd = (event: AnimationEvent) => {
        if (event.animationName === 'slideOut') {
          dialog.close()
          dialog.classList.remove('hide', 'modal-dialog')
          document.body.style.overflow = 'unset'
          dialog.removeEventListener('animationend', handleAnimationEnd)
        }
      }

      dialog.addEventListener('animationend', handleAnimationEnd)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Manejar eventos del dialog
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // Manejar cierre nativo (ESC key)
    const handleClose = () => {
      onClose()
    }

    dialog.addEventListener('close', handleClose)

    return () => {
      dialog.removeEventListener('close', handleClose)
    }
  }, [onClose])

  return (
    <dialog
      ref={dialogRef}
      className={`
        backdrop:bg-black/50 
        bg-transparent 
        p-0 
        border-none 
        outline-none
        max-w-none
        max-h-none
        m-0
        inset-0
        w-screen 
        h-screen
        flex
        items-center
        justify-center
        ${className}
      `}
      onClick={() => !disableBackdropClick && onClose()}
    >
      <div
        className={`
          bg-white 
          rounded-lg 
          shadow-xl 
          ${maxWidthClasses[maxWidth]} 
          w-full 
          max-h-[90vh] 
          flex 
          flex-col
          mx-4
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        {title && (
          <div className='flex items-center justify-between p-6 border-b border-gray-200'>
            <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 transition-colors'
              aria-label='Cerrar modal'
            >
              <svg
                className='w-6 h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className='p-6 overflow-y-auto flex-1'>{children}</div>
      </div>
    </dialog>
  )
}
