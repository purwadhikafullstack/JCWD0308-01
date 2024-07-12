'use client'
import { getWarehouse } from '@/app/action'
import DisplayOrder from '@/components/order/DisplayOrder'
import { Button } from '@/components/ui/button'
import { IOrder, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { WarehouseDropdown } from '../../_components/warehouseDropdown'
import { toast } from 'sonner'
import DashboardWrapper from '../_components/DashboardWrapper'
import DashboardHeaderPhoto from '../_components/DashboardHeaderPhoto'

export default function Page() {
  const [selectedWH, setSelectedWH] = useState('')
  const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
  const [isSuper, setIsSuper] = useState(false)


  useEffect(() => {
    const getAdmWH = async() => {
      try {
        const admin = await getAdminClientSide()
        const warehouse = await getWarehouse(admin.id)
        setWarehouseList(warehouse)
        if (admin.role == 'warAdm') {
          if (!warehouse || warehouse.length == 0) {
            setSelectedWH('Not Assigned')
            throw 'You are not assigned to any warehouse.'
          }
          setSelectedWH(warehouse[0].warehouseName)
        } else if (admin.role == 'superAdm') {
          setSelectedWH('All Warehouses')
          setIsSuper(true)
        }
      } catch (error:any) {
        typeof(error) == 'string' ? toast.error(error) : toast.error('Failed to get data.')
      }
    }
    getAdmWH();
  }, []);

  return (
      <DashboardWrapper className='relative'>
        <DashboardHeaderPhoto imgUrl={'https://images.pexels.com/photos/12935051/pexels-photo-12935051.jpeg'} />
        <div className='flex flex-col w-full items-start mb-[14.5rem] relative z-[1]'>
            <WarehouseDropdown
                selectedWH={selectedWH}
                setSelectedWH={setSelectedWH}
                warehouseList={warehouseList}
                isSuper={isSuper}
            />
        </div>

        <DisplayOrder warehouse={selectedWH}/>

      </DashboardWrapper>
  )
}
