import useSidebarStore from '@/store/sidebar'

export default function useSidebar() {
  const sidebarMenu = useSidebarStore(state => state.isOpen)
  const setIsOpen = useSidebarStore(state => state.setIsOpen)

  const openSidebar = () => setIsOpen(true)
  const closeSidebar = () => setIsOpen(false)

  return {
    closeSidebar,
    openSidebar,
    sidebarMenu
  }
}
