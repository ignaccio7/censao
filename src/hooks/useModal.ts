import useModalStore from '@/store/modal'

export default function useModal() {
  const modal = useModalStore(state => state.isOpen)
  const setModal = useModalStore(state => state.setIsOpen)

  const openModal = () => setModal(true)
  const closeModal = () => setModal(false)

  return {
    modal,
    closeModal,
    openModal
  }
}
