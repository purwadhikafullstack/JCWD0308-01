import React, { useEffect, useState } from 'react'
import { Selector } from '../../../../../components/selector'
import { IProduct, IWarehouse } from '@/constants'
import { Label } from '@radix-ui/react-label'
import { changeStock, getProductName, getProductSlug } from '@/app/action'
import Image from 'next/image'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EditStockTable } from './editStockTable'
import { CancelAlert } from '@/components/cancelAlertTemplate'
import { SubmitAlert } from '@/components/submitAlertTemplate'
import { toast } from 'sonner'
import { StockSelector } from './stockSelector'

interface IDropdown {
    selectedWH:string,
    warehouseList: IWarehouse[]
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
  }

  interface IStockArray {
    size: string
    id: string
    qty: number
    variant: string
  }

  interface IName {
    name: string
  }


export const StockForm = ({selectedWH, warehouseList, setOpen}:IDropdown) => {
  const [product, setProduct] = useState('')
  const [warehouse, setWarehouse] = useState(selectedWH)
  const [productData, setProductData] = useState<IProduct>()
  const [nameArr, setNameArr] = useState<IName[]>([])
  const [size, setSize] = useState('All Sizes')
  const [updateType, setUpdateType] = useState('RESTOCK')
  const [stockArray, setStockArray] = useState<IStockArray[]>([])
  const [isValid, setIsValid] = useState(false)
  const [search, setSearch] = useState('')

 

  const getData = async() => {
    if (product) {
      const slug = product.toLowerCase().replaceAll(" ", "-") 
      const sizeValue = size === "All Sizes" ? "" : size
      const wh = warehouse == 'All Warehouses' ? '' : warehouse
      const prodData = await getProductSlug(slug, wh, sizeValue)      
      setProductData(prodData.productList)
    }
  }
  
  const handleSubmit = async() => {
    try {
      if (!isValid) {
        toast.error('Stock data is incomplete.')
      } else {
        const loadingToast = toast.loading('Updating stocks, please wait.')
        loadingToast
        const stockInput = {warehouseName: warehouse,type: updateType,variant: [...stockArray]}
        const res = await changeStock(stockInput)
        if (res.status === 'ok') {
          toast.dismiss(loadingToast)
          toast.success('Stock successfully updated. Stock changes added to log.')
          setStockArray([])
          getData()
          setOpen(false)
        } else {
          toast.dismiss(loadingToast)
          typeof(res.message) == 'string' ? toast.error(res.message) : toast.error('Failed to update stock.')
        }
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const getProdList = async() => {
      try {   
        const res = await getProductName(search)
        if (res.data.length == 0) throw "No product found."
        const prodName = await res.data 
        setNameArr(prodName)
        setProduct(prodName[0].name)
      } catch (error:any) {
        typeof(error) == 'string' ?  toast.error(error) : toast.error('Failed to get products.')
        }
      }
    getProdList()
  }, [search])
  
  useEffect(() => {
    getData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, warehouse, size])

  return (
    <div className='overflow-x-hidden space-y-8'>
    <div className='mt-7 flex max-md:flex-col gap-5 w-full'>
      <div className='sm:w-[250px] w-full bg-gray-100 rounded-sm p-4 items-center justify-between max-md:hidden'>
        <div>
          <Label className="font-bold text-base block mb-2">Select Product</Label>
          
          <StockSelector 
                  width='max-sm:w-32 w-[168px]'
                  label="products"
                  defValue={product}
                  state={nameArr.map(item => item.name)}
                  setState={setProduct}
                  setSearch={setSearch}
              />
        </div>
        <Image
          width={168}
          height={168}
          className={`mb-2 rounded-md border-[1px] border-gray-200 w-[100px] md:w-[168px] mt-4 h-[100px] md:h-[168px] object-cover object-center`}
          alt={'main image'}
          src={(productData?.thumbnailURL ?  productData?.thumbnailURL :  '/images/emptyimage.png')}
      />
      </div>
      <ScrollArea className="flex max-md:h-[65vh] md:h-[500px] w-full">
          <div className='w-full bg-gray-100 rounded-sm p-4 max-md:flex items-center justify-between md:hidden'>
            <div>
              <Label className="font-bold text-base block mb-2">Select Product</Label>
              <StockSelector 
                  width='max-sm:w-32 w-[168px]'
                  label="products"
                  defValue={product}
                  state={nameArr.map(item => item.name)}
                  setState={setProduct}
                  setSearch={setSearch}
              />
            </div>
            <Image
              width={168}
              height={168}
              className={`mb-2 rounded-md border-[1px] border-gray-200 w-[100px] md:w-[168px] mt-4 h-[100px] md:h-[168px] object-cover object-center`}
              alt={'main image'}
              src={(productData?.thumbnailURL ?  productData?.thumbnailURL :  '/images/emptyimage.png')}
          />
          </div>
          <Label className="font-bold text-base block mb-2">Select warehouse</Label>
          <Selector 
              width='w-52 max-sm:w-full'
              label="Warehouses"
              defValue={warehouse}
              state={(warehouseList.length > 1 ? ["All Warehouses", ...warehouseList] : [...warehouseList])}
              setState={setWarehouse}
          />

          <Separator className="my-7"/>

          <Label className="font-bold text-base block mb-2">Create Stock Updates</Label>
          <Select defaultValue='RESTOCK' onValueChange={(value) => setUpdateType(value)}>
            <SelectTrigger 
            className={`focus:ring-transparent  focus-visible:border-[1px] focus-visible:border-black border-none text-xs truncate w-36 rounded-full font-semibold
              ${updateType === "RESTOCK" ? "bg-green-200 sm:hover:bg-green-100" : "bg-red-100 sm:hover:bg-red-50"} text-black transition-colors h-7`}
              >
              <SelectValue placeholder={"Update Type"}/>
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value={"RESTOCK"} >
                    <div className="flex items-center gap-2 text-xs font-semibold text-green-700">
                      <p>Add Stock</p>
                    </div>
                  </SelectItem>
                  <SelectItem value={"REMOVE"} >
                    <div className="flex items-center gap-2 text-xs font-semibold text-red-700">
                      <p>Remove Stock</p>
                    </div>
                  </SelectItem>
            </SelectContent>
          </Select>

    <div className=''>
                <EditStockTable 
                  setStockArray={setStockArray}
                  stockArray={stockArray}
                  productData={productData!}
                  updateType={updateType}
                  isValid={isValid}
                  setIsValid={setIsValid}
                  size={size}
                  setSize={setSize}
                  warehouse={warehouse}
                  warehouseList={warehouseList}
                />
    </div>
      </ScrollArea>
    </div>
      <div className="flex gap-2 justify-end">
            <CancelAlert setOpen={setOpen} title={'Close stock editor?'} cta={'Cancel'} message={'All changes will be lost.'}/>
            <SubmitAlert action={handleSubmit} title={'Update product stock?'} cta={'Update'} message={'Make sure all data are correct.'}/>
      </div>
    </div>
  )
}
