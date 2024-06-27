'use client'
import { StatisticsCard } from '@/app/(dashboard)/_components/statisticsCard'
import { WarehouseDropdown } from '@/app/(dashboard)/_components/warehouseDropdown'
import React, { useEffect, useState } from 'react'
import { getCategory, getProduct, getWarehouse } from '@/app/action'
import { ManageCategoryDialog } from '@/app/(dashboard)/_components/manageCategoryModal/categoryDialog'
import { CreateProductDialog } from '@/app/(dashboard)/_components/manageProductModal/createProductDialog'
import { AdminProductDisplay } from '@/app/(dashboard)/_components/manageProductModal/displayProduct'
import { IProduct, IWarehouse } from '@/constants'
import { getAdminClientSide } from '@/lib/utils'



export  function Products() {
const [selectedWH, setSelectedWH] = useState('All Warehouses')
const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
const [productList, setProductList] = useState<IProduct[]>([])
const [open, setOpen] = useState(false);
const [categoryLength, setCategoryLength] = useState(0) 
const [productQty, setProductQty] = useState(0) 
const [page, setPage] = useState(1)
const [isSuper, setIsSuper] = useState(false)


const getAdmWH = async() => {
  const admin = await getAdminClientSide()
  const warehouse = await getWarehouse(admin.id)
  setWarehouseList(warehouse)
  if (admin.role == 'warAdm') {
    setSelectedWH(warehouse[0].warehouseName)
  } else if (admin.role == 'superAdm') {
    setSelectedWH('All Warehouses')
    setIsSuper(true)
  }
}

const getData = async(wh:string) => {
    const product = await getProduct(wh, page)
    const category = await getCategory("", "")
    setProductList(product.productList)
    setProductQty(product.totalProduct)
    setCategoryLength(category.totalStock)
  }

  useEffect(() => {
    getAdmWH()
  }, [])
  
  useEffect(() => {
    if (selectedWH) {
      getData(selectedWH)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWH, open, page])
  
  
  return (
    <div className='flex flex-col w-full py-10 px-10 md:px-20'>
      
      <div className='flex w-full mb-7 flex-col-reverse xl:flex-row'>
        <div className='flex gap-5 md:gap-10 max-md:flex-wrap'>
          <StatisticsCard 
            title='Products'
            number={productQty ? productQty : 0}
            modalElement={<CreateProductDialog isSuper={isSuper} setOpen={setOpen} open={open}/>}
          />
          <StatisticsCard 
            title='Categories'
            number={categoryLength}
            modalElement={<ManageCategoryDialog isSuper={isSuper}/>}
          />
        </div>
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

      <div>
        <AdminProductDisplay 
        page={page}
        setPage={setPage}
        productList={productList}
        getData={() => getData(selectedWH)}
        productQty={productQty}
        isSuper={isSuper}
        />
      </div>   
    </div>
  )
}
