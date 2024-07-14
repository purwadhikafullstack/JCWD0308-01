'use client'
import {getProductSlug, getSalesDetail, getWarehouse } from '@/app/action'
import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import { IOrderItem2, IProduct, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import React, { useEffect, useState } from 'react'
import { PiCaretCircleLeft } from 'react-icons/pi'
import { DateRange } from "react-day-picker"
import { PiFileArrowDownFill } from "react-icons/pi";
import { DatePickerWithRange } from '../../stocks/_components/datePicker'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { SalesDetailTable } from '../_components/salesDetailTable'
import { Selector } from '@/components/selector'
import ExcelButton from '@/app/(dashboard)/_components/excelButton'
import { downloadSalesDetailsToExcel } from '@/lib/xlsx'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

const monthFirstDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}



export default function SalesDetail () {  
  const {slug} = useParams()
  const [selectedWH, setSelectedWH] = useState('All Warehouses')
  const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
  const [productQty, setProductQty] = useState(0)
  const [salesData, setSalesData] = useState<IOrderItem2[]>([])
  const [prodName, setProdName] = useState('')
  const [productData, setProductData] = useState<IProduct>()
  const [gross, setGross] = useState(0)
  const [sold, setSold] = useState(0)
  const [page, setPage] = useState(1)
  const [isSuper, setIsSuper] = useState(false)
  const [variants, setVariants] = useState('All')
  const [size, setSize] = useState('All')
  const router = useRouter()
  const [date, setDate] = useState<DateRange | undefined>({
    from: monthFirstDate(),
    to: new Date(),
  })

  const getAdmWH = async() => {
    const admin = await getAdminClientSide()
    const warehouse = await getWarehouse(admin.id)
    setWarehouseList(warehouse)
    if (admin.role == 'warAdm') {
      setSelectedWH(warehouse[0].warehouseName)
    } else if (admin.role == 'superAdm') {
      setIsSuper(true)
    }
  }

  const getData = async() => {
    if (date?.from && date?.to && selectedWH) {
      try {
        window.scrollTo(0, 0);
        const warehouse = selectedWH == 'All Warehouses'? '' : selectedWH
        const v = variants == 'All' ? '' : variants 
        const s = size == 'All' ? '' : size 
        const filter = {date, v, s}
        const res = await getSalesDetail(String(slug), warehouse, page, 10, filter)
        if (res.status == 'error') throw res.message
        const prod = await getProductSlug(String(slug), warehouse, '')
        setProductQty(res.totalGross._count)
        setProdName(prod.productList.name)
        setProductData(prod.productList)
        setSalesData(res.productSales)
        setGross(res.totalGross._sum.price)
        setSold(res.totalGross._sum.quantity)
      } catch (error) {
        typeof(error) == 'string' ? toast.error(error) : 'Failed to get sales data.'
        router.push('/admins/sales')
      }
    }
  }

  useEffect(() => {
    getAdmWH()
  }, [])

  useEffect(() => {
    getData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWH, page, date, size, variants])
  
  return (
    <div className='p-4 sm:p-8 lg:px-10 lg:py-6'>  

      <div className='flex mb-7 w-fit lg:w-full items-center max-sm:flex-col gap-y-7'>
        <div className='w-full flex items-center gap-0 text-black/60 max-lg:hidden'>
          <Button variant={'ghost'} className='w-5 max-sm:h-5 sm:w-10 p-0'>
              <Link href={'/admins/sales/'} >
              <PiCaretCircleLeft className='text-xs sm:text-3xl'/>
              </Link>
          </Button>
          <h1 className='text-xl xl:text-2xl font-medium'>Product Sales Details</h1>
        </div>
        <div className='flex flex-col w-fit lg:w-full items-start lg:items-end z-10'>
          <WarehouseDropdown 
              selectedWH={selectedWH}
              setSelectedWH={setSelectedWH}
              warehouseList={warehouseList}
              isSuper={isSuper}
          />
        </div>
      </div>

      <div className="flex max-sm:flex-col items-center justify-center border-[1px] gap-y-5 w-full shadow-md rounded-lg sm:px-10 py-10 gap-10 xl:gap-20 mb-10">
        <div className="flex flex-col justify-center items-start">
          <p className="max-sm:text-center max-sm:font-semibold max-xl:font-medium text-xl sm:text-3xl xl:text-4xl  text-balance">{prodName}</p>
          <Separator className="bg-black my-1 sm:my-2"/>
        </div>

        <div className="grid sm:min-w-72 grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-4 items-center">
          <p className="text-left lg:text-xl">
            Total Sales
          </p>
          <p className="text-right sm:text-left font-medium text-xl lg:text-2xl">
          <span className='text-gray-400 text-sm font-normal'>
              Rp
            </span>
            {(new Intl.NumberFormat('en-DE').format(gross))}
          </p>
          <p className="text-left lg:text-xl">
            Sold Quantity
          </p>
          <p className="text-right sm:text-left font-medium text-xl lg:text-2xl">
            {sold} 
            <span className='ml-1 text-gray-400 text-sm font-normal'>
              Items
            </span>
          </p>
        </div>
      </div>
      
      <div>

        <div className='flex items-center flex-wrap gap-y-5 justify-between'>
          <ExcelButton func={() => downloadSalesDetailsToExcel(salesData, prodName, selectedWH)}/>
          <div className='flex gap-2 flex-1 w-full justify-end items-center'>
            {productData &&             
            <Selector
              width='w-20 md:w-32'
              label="variants"
              state={["All", ...productData.variants.map(item => item.color)]}
              setState={setVariants}                
            /> }
            {productData &&             
            <Selector
              width='w-20 md:w-32'
              label="Size"
              state={productData.oneSize ? "One Size" : ["All", "XL", "L", "M", "S"]}
              setState={setSize}              
            /> }
            <DatePickerWithRange date={date} setDate={setDate}/>
          </div>

        </div>

        <SalesDetailTable
            salesData={salesData}
            page={page}
            productQty={productQty}
            setPage={setPage}
          />
        
      </div>   
    </div>
  )
}
