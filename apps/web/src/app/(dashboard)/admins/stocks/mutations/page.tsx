'use client'

import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import { getMutationRequest, getWarehouse } from '@/app/action'
import { IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { setTimeout } from 'timers'
import { PiCaretCircleLeft } from "react-icons/pi";
import { Button } from '@/components/ui/button'
import { MutationTabs } from './_components/tabs'
import Link from 'next/link'

export default function Mutation() {
  const router = useRouter()
  const [selectedWH, setSelectedWH] = useState('')
  const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
  const [isSuper, setIsSuper] = useState(false)



  
  
  const getAdmWH = async() => {
    const admin = await getAdminClientSide()
    const warehouse = await getWarehouse(admin.id)
    setWarehouseList(warehouse)
    if (admin.role == 'warAdm') {
      setSelectedWH(warehouse[0].warehouseName)
    } else if (admin.role == 'superAdm') {
      toast.error('You are not authorized.')
      setTimeout(() => {
        router.push('/admins/stocks')
    }, 1000)
      
    }
  }

  useEffect(() => {
    getAdmWH()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])


  return (
    <div className='p-4 sm:p-8 lg:px-10 lg:py-6'>
      
      <div className='flex gap-5 mb-7 lg:mb-14 md:gap-10 max-md:flex-wrap z-10'>
        <div className='w-full flex items-center text-black/60 gap-0 max-lg:hidden'>
          <Button variant={'ghost'} className='w-5 max-sm:h-5 sm:w-10 p-0'>
            <Link href={'/admins/stocks/'} >
              <PiCaretCircleLeft className='text-xs sm:text-3xl'/>
            </Link>
          </Button>
          <h1 className='text-xl sm:text-2xl font-medium'>Manage Mutations</h1>
        </div>
        <div className='flex flex-col w-fit lg:w-full items-start lg:items-end z-10'>
            {/* <p className='text-xl'>Warehouse</p> */}
            <WarehouseDropdown 
                selectedWH={selectedWH}
                setSelectedWH={setSelectedWH}
                warehouseList={warehouseList}
                isSuper={isSuper}
            />
        </div>
      </div>

      <MutationTabs selectedWH={selectedWH}/>


    </div>
  )
}
