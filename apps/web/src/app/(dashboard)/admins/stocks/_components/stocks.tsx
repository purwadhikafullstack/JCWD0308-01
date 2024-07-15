'use client'
import { getAllStock, getMutationRequest, getWarehouse } from '@/app/action'
import { StockDialog } from '@/app/(dashboard)/admins/stocks/_components/stocksDialog'
import { StockTable } from '@/app/(dashboard)/admins/stocks/_components/stocksTable'
import { StatisticsCard } from '@/app/(dashboard)/_components/statisticsCard'
import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import { Input } from '@/components/ui/input'
import { IProduct, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { PiArrowSquareOut, PiMagnifyingGlass } from 'react-icons/pi'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { DatePickerWithRange } from './datePicker'
import { DateRange } from "react-day-picker"
import { PiFileArrowDownFill } from "react-icons/pi";
import { SalesPopover } from '../../sales/_components/salesPopover'
import { useDebouncedCallback } from 'use-debounce'
import xlsx, { IContent, IJsonSheet } from "json-as-xlsx";
import { downloadStockToExcel } from '@/lib/xlsx'
import ExcelButton from '@/app/(dashboard)/_components/excelButton'
import Image from 'next/image'
import { toast } from 'sonner'

const monthFirstDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export const Stocks = () => {  
  const [selectedWH, setSelectedWH] = useState('')
  const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
  const [productList, setProductList] = useState<IProduct[]>([])
  const [inventory, setInventory] = useState(0)
  const [productQty, setProductQty] = useState(0)
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1)
  const [isSuper, setIsSuper] = useState(false)
  const [gender, setGender] = useState('All')
  const [type, setType] = useState('All')
  const [category, setCategory] = useState('All')
  const [q, setQ] = useState('')
  const [notif, setNotif] = useState(0)
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
      const res = await getAllStock(warehouse, page, 10, filter)
      
      if (res.status == 'ok') {
        setProductQty(res.totalProduct)
        setProductList(res.productList)
        setInventory(res.totalStock)
      }
    }
  }

  useEffect(()=> {
    if (selectedWH !== 'All Warehouses' && selectedWH !== 'Not Assigned') {
        const getQty = async() => {
          const res = await getMutationRequest(selectedWH, 'waiting', 1, 1000);
          if (res.status === 'ok') {
            setNotif(res.data.total);
          }
        }
      getQty()
    }
  }, [selectedWH])

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
    getAdmWH()
  }, [])

  useEffect(() => {
    getData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWH, page, date, gender, type, category, q, open])
  
  return (
    <div>  
      <div className='flex w-full flex-col-reverse xl:flex-row relative p-4 sm:p-8 lg:px-10 lg:py-6'>
        <div className='flex gap-5 md:gap-10 max-md:flex-wrap z-10'>
          <StatisticsCard 
            title='Total Inventories'
            number={inventory ? inventory : 0}
          />
        </div>
        <div className='flex flex-col mb-7 w-fit lg:w-full items-start lg:items-end z-10'>
            {/* <p className='text-sm md:text-xl bg-white/80 mb-2 px-2  max-md:font-semibold'>Warehouse</p> */}
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
          width={5184}
          height={3456}
          alt='productimage' 
          src={'https://images.unsplash.com/photo-1586528116691-012ff3ac0fec?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          />
        </div> 
      </div>

      <div className='p-4 sm:p-8 lg:px-10 lg:py-6'>

        <div className='flex items-center w-full gap-4 flex-wrap gap-y-5 justify-between'>
          <div className='flex gap-2 max-sm:justify-center max-sm:flex-wrap sm:flex-1 max-sm:w-full'>
            <div className={`${productList && selectedWH !== 'Not Assigned' ? "" : 'hidden'}`}>
              <StockDialog 
                selectedWH={selectedWH} 
                setSelectedWH={setSelectedWH} 
                warehouseList={[...warehouseList]} 
                setOpen={setOpen}
                open={open}
              />
            </div>
            <Link href={'/admins/stocks/mutations'} className={productList.length == 0 || isSuper? 'hidden' : 'relative'}>
              <Button variant={'outline'} className='flex items-center gap-1 max-sm:text-xs '>
                <p className='sm:hidden'>Mutation</p>
                <p className='max-sm:hidden'>Manage Mutation</p>
              <PiArrowSquareOut className="text-xl"/> </Button>
              <div className={`absolute -top-2 -right-1 text-[0.6rem] text-white bg-red-500 rounded-full min-w-5 h-5 items-center justify-center ${notif > 0 && !isSuper ? 'flex' : 'hidden'}`}>
                {notif > 10 ? '10+' : notif}
              </div>
            </Link>
            <div className={selectedWH !== 'Not Assigned' ? "" : 'hidden'}>
              <ExcelButton func={() => downloadStockToExcel(productList, selectedWH)} />
            </div>

          </div>

          <div className='flex flex-1 gap-2 max-sm:justify-between justify-end items-center'>
            <Input id='search' type="text" placeholder="Search products" className='w-full sm:max-w-60 min-w-44' onChange={(e) => debounced(e.target.value)}/>
            <DatePickerWithRange date={date} setDate={setDate}/>
            <SalesPopover gender={gender} type={type} category={category} setGender={setGender} setType={setType} setCategory={setCategory}/>
          </div>

        </div>

        <StockTable
            productList={productList}
            page={page}
            productQty={productQty}
            setPage={setPage}
          />
        
      </div>   
    </div>
  )
}
