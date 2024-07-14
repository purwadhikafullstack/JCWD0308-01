'use client'
import { WarehouseDropdown } from "@/app/(dashboard)/_components/warehouseDropdown";
import { getProductSlug, getStockDetail, getWarehouse } from "@/app/action";
import { IProduct, IStockMutationItem, IWarehouse } from "@/constants";
import { getAdminClientSide } from "@/lib/utils";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PiCaretCircleLeft, PiFileArrowDownFill } from "react-icons/pi";
import { DatePickerWithRange } from "../_components/datePicker";
import { StockDetailTable } from "../_components/stockDetailTable";
import { Selector } from "../../../../../components/selector";
import { Table,TableBody,TableCell, TableHead,TableHeader, TableRow} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator";
import ExcelButton from "@/app/(dashboard)/_components/excelButton";
import { downloadStockDetailsToExcel } from "@/lib/xlsx";
import { toast } from "sonner";

const monthFirstDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

export default function Page() {
    const {slug} = useParams()
    const typeArr = ['All','Restock', 'Remove', 'Transfer', 'Inbound', 'Delete', 'Transaction']
    const [selectedWH, setSelectedWH] = useState('')
    const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
    const [StockList, setStockList] = useState<IStockMutationItem[]>([])
    const [productData, setProductData] = useState<IProduct>()
    const [productQty, setProductQty] = useState(0)
    const [type, setType] = useState('All');
    const [page, setPage] = useState(1)
    const [isSuper, setIsSuper] = useState(false)
    const [variants, setVariants] = useState('All')
    const [size, setSize] = useState('All')
    const router = useRouter()
    const [date, setDate] = useState<DateRange | undefined>({
      from: monthFirstDate(),
      to: new Date(),
    })
  
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
      const getData = async() => {
        if (date?.from && date?.to && selectedWH !== '' && selectedWH !== 'Not Assigned') {
          try {
            window.scrollTo(0, 0);
            const warehouse = selectedWH == 'All Warehouses'? '' : selectedWH
            const v = variants == 'All' ? '' : variants 
            const s = size == 'All' ? '' : size 
            const t = type == 'All' ? '' : type 
            const filter = {date, t, v, s}
            const res = await getStockDetail(String(slug), warehouse, page, 10, filter)
            if (res.status == 'error') throw res.message
            const prod = await getProductSlug(String(slug), warehouse, '')
            setStockList(res.stockList)
            setProductQty(res.totalData)
            setProductData(prod.productList)
          } catch (error:any) {
            typeof(error) == 'string' ? toast.error(error) : 'Failed to get stock data.'
            router.push('/admins/stocks')
          }
        }
      }
      getData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWH, type, page, date, size, variants])
    
    return (
      <div className="flex flex-col w-full min-h-screen">  
       <div className='flex gap-5 mb-7  w-fit lg:w-full lg:mb-14 md:gap-10 max-md:flex-wrap z-10'>
            <div className='w-full flex items-center text-black/60 gap-0 max-lg:hidden'>
            <Button variant={'ghost'} className='w-5 max-sm:h-5 sm:w-10 p-0'>
                <Link href={'/admins/stocks/'} >
                <PiCaretCircleLeft className='text-xs sm:text-3xl'/>
                </Link>
            </Button>
            <h1 className='text-xl xl:text-2xl font-medium'>Product Stock Details</h1>
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

          <div className="flex max-sm:flex-col items-center justify-evenly border-[1px] gap-y-5 w-full shadow-md rounded-lg sm:px-10 py-3 gap-10 xl:gap-20 mb-10">
              <div className="flex flex-col justify-center items-start">
                <p className="max-sm:text-center max-sm:font-semibold max-xl:font-medium text-xl sm:text-3xl xl:text-5xl  text-balance">{productData?.name}</p>
                <Separator className="bg-black my-1 sm:my-2"/>
                <p className="max-sm:text-center w-full max-sm:text-sm text-gray-400">Current Stock: {productData?.totalStock}</p>
              </div>

            <div className="">
              {
                <Table className="text-xs">
                <TableHeader>
                    {productData?.oneSize ?
                      <TableRow>
                        <TableHead className="text-center max-sm:h-5 max-sm:py-2">Variant</TableHead>
                          <TableHead className="text-center max-sm:h-5 max-sm:py-2">One Size</TableHead>
                      </TableRow>
                        :
                        <TableRow>
                          <TableHead className="text-center max-sm:h-5 max-sm:py-2">Variant</TableHead>
                          <TableHead className="text-center max-sm:h-5 max-sm:py-2">XL</TableHead>
                          <TableHead className="text-center max-sm:h-5 max-sm:py-2">L</TableHead>
                          <TableHead className="text-center max-sm:h-5 max-sm:py-2">M</TableHead>
                          <TableHead className="text-center max-sm:h-5 max-sm:py-2">S</TableHead>
                        </TableRow>
                    }
                </TableHeader>
                <TableBody>
                  {productData ? 
                  productData.variants.map((item, index) => {
                    return (  
                    <TableRow key={item.id}>
                      <TableCell className="text-center max-sm:h-5 max-sm:py-2 font-semibold">{item.color}</TableCell>
                      <TableCell className={`text-center max-sm:h-5 max-sm:py-2 ${productData.oneSize? 'hidden': ''}`}>{item.warehouseProduct.filter(product => product.size === 'XL').reduce((total, product) => total + product.stock, 0)}</TableCell>
                      <TableCell className={`text-center max-sm:h-5 max-sm:py-2 ${productData.oneSize? 'hidden': ''}`}>{item.warehouseProduct.filter(product => product.size === 'L').reduce((total, product) => total + product.stock, 0)}</TableCell>
                      <TableCell className={`text-center max-sm:h-5 max-sm:py-2 ${productData.oneSize? 'hidden': ''}`}>{item.warehouseProduct.filter(product => product.size === 'M').reduce((total, product) => total + product.stock, 0)}</TableCell>
                      <TableCell className={`text-center max-sm:h-5 max-sm:py-2 ${productData.oneSize? 'hidden': ''}`}>{item.warehouseProduct.filter(product => product.size === 'S').reduce((total, product) => total + product.stock, 0)}</TableCell>
                      <TableCell className={`text-center max-sm:h-5 max-sm:py-2 ${productData.oneSize? '': 'hidden'}`}>{item.warehouseProduct.filter(product => product.size === 'ONESIZE').reduce((total, product) => total + product.stock, 0)}</TableCell>
                    </TableRow>
                    )
                  })
                  :
                  <TableRow>
                    <TableCell className="font-medium text-center" colSpan={7} >Data will appear here.</TableCell>
                  </TableRow>
                } 
                </TableBody>
              </Table>
              }
            </div>
          </div>

  
        <div>
  
          <div className='flex items-center justify-between gap-4 flex-wrap gap-y-5 w-full '>
            <ExcelButton func={() => downloadStockDetailsToExcel(StockList, productData!.name, selectedWH)} />
  
            <div className='flex gap-2 flex-1 justify-end items-center'>
              <DatePickerWithRange date={date} setDate={setDate}/>
              {productData &&             
              <Selector
                width='max-sm:max-w-16 sm:w-20 lg:w-32'
                label="variants"
                state={productData ? ["All", ...productData.variants.map(item => item.color)] : ['All']}
                setState={setVariants}                
              /> }
              {productData &&             
              <Selector
                width='max-sm:max-w-16 sm:w-20 lg:w-32'
                label="Size"
                state={productData.oneSize && productData ? ["One Size"] : ["All", "XL", "L", "M", "S"]}
                setState={setSize}              
              /> }
              <Selector 
                label="Type"
                setState={setType}
                state={typeArr}
                width="max-sm:max-w-16 sm:w-20 lg:w-32"
              />
              
            </div>
          </div>
  
          <StockDetailTable
            StockList={StockList}
            page={page}
            productQty={productQty}
            setPage={setPage}
            isSuper={isSuper}
          />
        </div>   
      </div>
    )
}