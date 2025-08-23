import type { PersonaCompletaProps, PersonaKeys } from '@/interfaces'
import dictionaryProfile from '../utils/dictionaryProfile'
import CustomInputProfile from './customInputProfile'

export default function FormProfileData(data: PersonaCompletaProps) {
  const keys = (Object.keys(data) as PersonaKeys[]).filter(
    key => key in dictionaryProfile && data[key] !== undefined
  )

  return (
    <>
      {keys?.map(key => {
        const label = dictionaryProfile[key]
        const value = data[key]
        return (
          <div className='data-group' key={key}>
            <CustomInputProfile
              label={label || key}
              initialValue={value?.toString() || ''}
              onSave={() => {}} // TODO: agregar funcion para actualizar el perfil
            />
          </div>
        )
      })}
    </>
  )
}
