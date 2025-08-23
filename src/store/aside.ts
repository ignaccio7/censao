import { create } from 'zustand'

interface AsideState {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const useAsideStore = create<AsideState>((set, _) => ({
  isOpen: false,
  setIsOpen: open => set({ isOpen: open })
}))

export default useAsideStore
