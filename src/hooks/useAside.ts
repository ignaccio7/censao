import useAsideStore from '@/store/aside'

export default function useAside() {
  const aside = useAsideStore(state => state.isOpen)
  const setAside = useAsideStore(state => state.setIsOpen)

  const openAside = () => setAside(true)
  const closeAside = () => setAside(false)

  return {
    aside,
    closeAside,
    openAside
  }
}
