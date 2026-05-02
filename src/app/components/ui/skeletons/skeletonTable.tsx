export default function SkeletonTable({
  columns,
  rows
}: {
  columns: number
  rows: number
}) {
  return (
    <div className='pb-4'>
      <div className='shadow-sm border border-gray-200'>
        {/* Vista desktop */}
        <div className='hidden md:block overflow-x-auto'>
          <table className='w-full rounded-lg overflow-hidden'>
            <thead className='bg-primary-700'>
              <tr>
                {[...Array(columns)].map((_, i) => (
                  <th key={i} className='px-6 py-3'>
                    <div className='h-4 w-24 bg-gray-300 rounded animate-pulse'></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, i) => (
                <tr key={i} className='border-b border-gray-200'>
                  {[...Array(columns)].map((_, j) => (
                    <td key={j} className='px-6 py-4'>
                      <div className='h-4 w-full bg-gray-200 rounded animate-pulse'></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Vista móvil */}
        <div className='block md:hidden'>
          {[...Array(rows)].map((_, i) => (
            <div key={i} className='p-4 border-b border-gray-200'>
              <div className='space-y-3'>
                {[...Array(columns)].map((_, j) => (
                  <div key={j} className='flex flex-col'>
                    <div className='h-3 w-20 bg-gray-300 rounded animate-pulse mb-1'></div>
                    <div className='h-4 w-full bg-gray-200 rounded animate-pulse'></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
