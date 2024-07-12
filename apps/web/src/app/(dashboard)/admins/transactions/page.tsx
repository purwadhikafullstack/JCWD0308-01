'use client'
import { getWarehouse } from '@/app/action'
import DisplayOrder from '@/components/order/DisplayOrder'
import { Button } from '@/components/ui/button'
import { IOrder, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { WarehouseDropdown } from '../../_components/warehouseDropdown'
import { toast } from 'sonner'

export default function Page() {
  const [selectedWH, setSelectedWH] = useState('All Warehouses')
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
    <section className='flex flex-col w-full min-h-screen py-10 px-10 md:px-20'>
      <div className='flex w-full mb-7 flex-col-reverse xl:flex-row'>
        <div className='flex flex-col w-full items-end mb-7'>
          <p className='text-xl'>Warehouse</p>
          <WarehouseDropdown
            selectedWH={selectedWH}
            setSelectedWH={setSelectedWH}
            warehouseList={warehouseList}
            isSuper={isSuper}
          />
        </div>
      </div>

      <DisplayOrder warehouse={selectedWH}/>



    </section>
  )
}
