import React from 'react'

interface FichasStatCardProps {
  title: string
  count: number
  icon: React.ReactNode
  textColorClass: string
}

export default function FichasStatCard({
  title,
  count,
  icon,
  textColorClass
}: FichasStatCardProps) {
  return (
    <div className='card-patients flex justify-between gap-1 p-2 sm:flex-col w-full sm:p-4 border border-gray-300 bg-white rounded-xl'>
      <h3 className='flex justify-between gap-2 items-center font-bold text-gray-700 text-step-1'>
        {title}
        <small className={textColorClass}>{icon}</small>
      </h3>
      <p className={`number text-step-4 font-bold ${textColorClass}`}>
        {count}
      </p>
    </div>
  )
}
