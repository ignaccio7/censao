import { create } from 'zustand'

interface ModalState {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const useModalStore = create<ModalState>((set, _) => ({
  isOpen: false,
  setIsOpen: (open: boolean) => set({ isOpen: open })
}))

export default useModalStore
