'use client'
import { StatisticsCard } from '@/app/(dashboard)/_components/statisticsCard'
import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import React, { useCallback, useEffect, useState } from 'react'
import { getCategory, getProduct, getWarehouse } from '@/app/action'
import { ManageCategoryDialog } from '@/app/(dashboard)/_components/manageCategoryModal/categoryDialog'
import { CreateProductDialog } from '@/app/(dashboard)/admins/products/_components/manageProductModal/createProductDialog'
import { AdminProductDisplay } from '@/app/(dashboard)/admins/products/_components/manageProductModal/displayProduct'
import { IProduct, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'
import { DateRange } from 'react-day-picker'
import { PiFileArrowDownFill, PiMagnifyingGlass } from 'react-icons/pi'
import { Input } from '@/components/ui/input'
import { DatePickerWithRange } from '../../stocks/_components/datePicker'
import { SalesPopover } from '../../sales/_components/salesPopover'
import { useDebouncedCallback } from 'use-debounce'
import ExcelButton from '@/app/(dashboard)/_components/excelButton'
import { downloadProductsToExcel } from '@/lib/xlsx'
import Image from 'next/image'
import { toast } from 'sonner'

const monthFirstDate = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}


export  function Products() {
const [selectedWH, setSelectedWH] = useState('')
const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
const [productList, setProductList] = useState<IProduct[]>([])
const [open, setOpen] = useState(false);
const [openC, setOpenC] = useState(false);
const [categoryLength, setCategoryLength] = useState(0) 
const [productQty, setProductQty] = useState(0)
const [gender, setGender] = useState('All')
const [type, setType] = useState('All')
const [category, setCategory] = useState('All')
const [q, setQ] = useState('')
const [page, setPage] = useState(1)
const [isSuper, setIsSuper] = useState(false)
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



const getData = useCallback(async () => {
  if (date?.from && date?.to && selectedWH !== '' && selectedWH !== 'Not Assigned') {
    window.scrollTo(0, 0);
    const g = gender === "All" ? '' : gender;
    const t = type === "All" ? '' : type;
    const c = category === "All" ? '' : category;
    const wh = selectedWH === 'All Warehouses' ? '' : selectedWH;
    const filter = { date, g, t, c, q };
    try {
      const [prod, cat] = await Promise.all([
        getProduct(wh, page, 10, filter),
        getCategory("", "")
      ]);
      
      if (prod.status === 'ok' && cat.status === 'ok') {
        setProductList(prod.productList);
        setProductQty(prod.totalProduct);
        setCategoryLength(cat.totalCategory);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    }
  }
}, [date, selectedWH, gender, type, category, page, q]);

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
    getData();
}, [getData,open, openC ]);

  
  
  return (
    <div className=''>
      <div className='flex w-full flex-col-reverse xl:flex-row relative gap-x-5 p-4 sm:p-8 lg:px-10 lg:py-6'>
        <div className='flex gap-5 max-md:flex-wrap z-10'>
          <StatisticsCard 
            title='Products'
            number={productQty ? productQty : 0}
            modalElement={<CreateProductDialog isSuper={isSuper} setOpen={setOpen} open={open}/>}
          />
          <StatisticsCard 
            title='Categories'
            number={categoryLength}
            modalElement={<ManageCategoryDialog isSuper={isSuper} setOpenC={setOpenC} openC={openC} />}
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
          width={5472}
          height={3648}
          alt='productimage' 
          src={'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'}
          />
        </div>
      </div>

      <div className='p-4 sm:p-8 lg:px-10 lg:py-6'>  
        <div className='flex w-full items-center max-sm:gap-2 gap-4 flex-wrap gap-y-5 justify-between'>
          <div className={selectedWH !== 'Not Assigned' ? "" : 'hidden'}>
            <ExcelButton func={() => downloadProductsToExcel(productList, selectedWH)}/>
          </div>

          <div className='flex flex-1 gap-2 max-sm:justify-between justify-end items-center'>
            <Input id='search' type="text" placeholder="Search products" className='w-full sm:max-w-60 min-w-44' onChange={(e) => debounced(e.target.value)}/>
            <DatePickerWithRange date={date} setDate={setDate}/>
            <SalesPopover gender={gender} type={type} category={category} setGender={setGender} setType={setType} setCategory={setCategory}/>
          </div>

        </div>

        <div className='w-full'>
          <AdminProductDisplay 
          page={page}
          setPage={setPage}
          productList={productList}
          getData={() => getData()}
          productQty={productQty}
          isSuper={isSuper}
          />
        </div>   
      </div>
    </div>
  )
}
