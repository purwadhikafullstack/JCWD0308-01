'use client'
import { getAllSales, getWarehouse } from '@/app/action'
import { StatisticsCard } from '@/app/(dashboard)/_components/statisticsCard'
import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import { Input } from '@/components/ui/input'
import { IProduct, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { PiMagnifyingGlass } from 'react-icons/pi'
import { DateRange } from "react-day-picker"
import { PiFileArrowDownFill } from "react-icons/pi";
import { DatePickerWithRange } from '../../stocks/_components/datePicker'
import { useDebouncedCallback } from 'use-debounce'
import { SalesPopover } from './salesPopover'
import { SalesTable } from './salesTable'
import ExcelButton from '@/app/(dashboard)/_components/excelButton'
import { downloadSalesToExcel } from '@/lib/xlsx'
import Image from 'next/image'
import { toast } from 'sonner'

const monthFirstDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export const SalesReport = () => {  
  const [selectedWH, setSelectedWH] = useState('')
  const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
  const [productQty, setProductQty] = useState(0)
  const [salesList, setSalesList] = useState<IProduct[]>([])
  const [gross, setGross] = useState(0)
  const [sold, setSold] = useState(0)
  const [gender, setGender] = useState('All')
  const [type, setType] = useState('All')
  const [category, setCategory] = useState('All')
  const [page, setPage] = useState(1)
  const [isSuper, setIsSuper] = useState(false)
  const [q, setQ] = useState('')
  const [date, setDate] = useState<DateRange | undefined>({
    from: monthFirstDate(),
    to: new Date(),
  })

  const debounced = useDebouncedCallback(
    (value) => {
        setQ(value);
      },
      500
  )

  const getData = async() => {
    if (date?.from && date?.to && selectedWH !== '' && selectedWH !== 'Not Assigned') {
      window.scrollTo(0, 0);
      const warehouse = selectedWH == 'All Warehouses'? '' : selectedWH
      const g = gender == "All" ? '' : gender
      const t = type == "All" ? '' : type
      const c = category == "All" ? '' : category
      const filter = {date, g, t, c, q}

      const res = await getAllSales(warehouse, page, 10, filter)
      if (res.status == 'ok') {       
          setProductQty(res.totalSales._count)
          setSalesList(res.SalesList)
          setGross(res.totalSales._sum.price)
          setSold(res.totalSales._sum.quantity)
      }
    }
  }
  
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

  useEffect(() => {
    getData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWH, page, date, gender, type, category, q])
  
  return (
    <div>  
      <div className='flex w-full flex-col-reverse xl:flex-row relative p-4 sm:p-8 lg:px-10 lg:py-6'>
        <div className='flex gap-5 md:gap-10 max-md:flex-wrap z-10'>
          <StatisticsCard 
            title='Total Sales'
            number={gross ? (new Intl.NumberFormat('en-DE').format(gross)) : 0}
          />
          <StatisticsCard 
            title='Sold Quantity'
            number={sold ? sold : 0}
          />
        </div>
        <div className='flex flex-col mb-7 w-fit lg:w-full items-start lg:items-end z-10'>
            {/* <p className='text-xl'>Warehouse</p> */}
            <WarehouseDropdown 
              isSuper={isSuper}
              warehouseList={[...warehouseList]}
              setSelectedWH={setSelectedWH}
              selectedWH={selectedWH}
            />
        </div>
        <div className='absolute inset-0 overflow-x-hidden'>
          <Image 
          className={`w-full h-full object-cover object-center z-0`}
          width={5472}
          height={3648}
          alt='productimage' 
          src={'https://images.unsplash.com/photo-1543286386-2e659306cd6c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          />
        </div> 
      </div>

      <div>
        <div className='p-4 sm:p-8 lg:px-10 lg:py-6'>  
          <div className='flex w-full items-center max-sm:gap-2 gap-4 flex-wrap gap-y-5 justify-between'>
            <div className={selectedWH !== 'Not Assigned' ? "" : 'hidden'}>
              <ExcelButton func={() => downloadSalesToExcel(salesList, selectedWH)}/>
            </div>

            <div className='flex flex-1 gap-2 max-sm:justify-between justify-end items-center'>
              <Input id='search' type="text" placeholder="Search products" className='w-full sm:max-w-60 min-w-44' onChange={(e) => debounced(e.target.value)}/>
              <DatePickerWithRange date={date} setDate={setDate}/>
              <SalesPopover gender={gender} type={type} category={category} setGender={setGender} setType={setType} setCategory={setCategory}/>
            </div>

          </div>

          <SalesTable
              salesList={salesList}
              page={page}
              productQty={productQty}
              setPage={setPage}
            />    
        </div>   
      </div>
  </div>
  )
}
