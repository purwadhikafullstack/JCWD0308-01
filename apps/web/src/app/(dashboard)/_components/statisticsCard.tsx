import React from 'react'

export const StatisticsCard = ({title, number, modalElement}:{title:string, number?:number | string, modalElement?: React.ReactNode}) => {
  const textSize = () => {
    let size
    if ( String(number).length > 6 ) {
      size = 'text-xl sm:text-3xl lg:text-5xl'
    } else if ( String(number).length > 4 ) {
      size = 'text-2xl sm:text-4xl lg:text-6xl'
    }  else {
      size = `text-3xl sm:text-5xl lg:text-7xl`
    }
    return size
  }

  return (
    <div className='bg-white/90 flex flex-col max-sm:items-center min-w-28 lg:min-w-72 flex-1 rounded-xl shadow-[0px_0px_6px_-2px_rgba(0,0,0,0.5)] max-sm:p-2 sm:py-5 sm:px-10'>
            <p className='text-base sm:text-xl lg:text-2xl'>{title}</p>
            <div className='flex max-sm:flex-col justify-between items-center'>
              <p className={`${textSize()} text-red-500`}>{number}</p>
              {modalElement}
            </div>
          </div>
  )
}
