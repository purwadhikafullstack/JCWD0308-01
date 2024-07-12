import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

export const ProductSkeleton = () => {
  return (
    <div className="w-full min-h-[100vh] flex justify-center">
        <div className="pt-5 pb-20 w-[320px] sm:w-[620px] md:w-[700px] lg:w-[850px] xl:w-[1100px]">
            <Skeleton className='h-5 w-96 mb-5'/>
            <div className=" flex max-md:justify-center justify-between">
                <div className="w-full sm:w-[500px] md:w-[330px] lg:w-[400px] xl:w-[500px]">
                    <Skeleton className='w-[320px] h-[320px]  sm:w-[500px] sm:h-[500px]  md:w-[330px] md:h-[330px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px]'/>

                    <div className="md:hidden">
                        <Separator className="my-3"/>
                        <div className="flex flex-col w-full md:mb-20">
                            <Skeleton className='w-full h-10 mb-2 sm:mb-5 md:mb-10'/>
                            <div className="font-medium flex items-end">
                                <Skeleton className='w-32 h-7'/>
                            </div>
                            <Separator className="mt-3 mb-5"/>
                            <Skeleton className='w-32 h-10'/>
                            <Skeleton className='w-32 h-10'/>
                            <Skeleton className='w-32 h-10'/>
                        </div>
                        <Separator className="mt-5 mb-3"/>
                    </div>

                </div>
                
                <div className="min-h-full max-md:hidden">
                <Skeleton className='w-full h-full'/>
                </div>
            </div>

            <div className="max-md:hidden">
            <Separator className="my-3"/>
            <div className="flex flex-col w-full md:mb-20">
                <Skeleton className='w-full h-10 mb-2 sm:mb-5 md:mb-10'/>
                <div className="font-medium flex items-end">
                    <Skeleton className='w-32 h-7'/>
                </div>
                <Separator className="mt-3 mb-5"/>
                <Skeleton className='w-32 h-10'/>
                <Skeleton className='w-32 h-10'/>
                <Skeleton className='w-32 h-10'/>
            </div>
            <Separator className="mt-5 mb-3"/>
        </div>
        </div>
        
       
    </div>
  )
}
