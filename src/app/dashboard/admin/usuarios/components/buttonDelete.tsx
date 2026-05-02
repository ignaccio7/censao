import { deleteUser } from '@/actions/usuarios/delete'
import { IconTrash } from '@/app/components/icons/icons'

export function DeleteButton({ id }: { id: string }) {
  const deleteUserWithId = deleteUser.bind(null, id)
  return (
    <form action={deleteUserWithId}>
      <button
        type='submit'
        className='px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium shadow-sm cursor-pointer'
        title='Eliminar'
      >
        <IconTrash />
      </button>
    </form>
  )
}
