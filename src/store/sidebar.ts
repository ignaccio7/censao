import { create } from 'zustand'

interface SidebarState {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}

const useSidebarStore = create<SidebarState>((set, _) => ({
  isOpen: false,
  setIsOpen: open => set({ isOpen: open })
}))

export default useSidebarStore
