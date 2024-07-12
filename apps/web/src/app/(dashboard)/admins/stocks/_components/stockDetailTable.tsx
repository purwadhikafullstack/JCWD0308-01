import { PaginationTemplate } from "@/components/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { IProduct, IStockMutationItem, IWarehouse } from "@/constants"
import { DateConvert } from "@/lib/dateConvert"
import Link from "next/link"
import { AiOutlineFileSearch } from "react-icons/ai";

interface IStockTable {
    StockList: IStockMutationItem[]
    setPage: React.Dispatch<React.SetStateAction<number>>
    page: number
    productQty: number
    isSuper: boolean
  }
  
  

  
  export function StockDetailTable({StockList, setPage, page, productQty, isSuper}:IStockTable) {   
    
    return (
      <div>
        <Table className="my-7">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead className="text-center">Variant</TableHead>
              <TableHead className="text-center">Size</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className={`text-center ${isSuper ? '' : 'hidden'}`}>Warehouse</TableHead>
              <TableHead className="text-center">Associated WH</TableHead>
              <TableHead className="text-center min-w-32">Date</TableHead>
              <TableHead className="text-center">Quantity</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {StockList && StockList.length > 0 
            ? 
            StockList.map((item, index) => {
              let date
              let dateU
              if (item.stockMutation?.createdAt) {date = DateConvert(item.stockMutation?.createdAt)}
              if (item.stockMutation?.updatedAt) {dateU = DateConvert(item.stockMutation?.updatedAt)}
              return (    
              <TableRow key={item.id}>
                <TableCell>{(index + 1 ) + ((page - 1) * 10)}</TableCell>
                <TableCell className="text-center">{item.WarehouseProduct.productVariant.color}</TableCell>
                <TableCell className="text-center">{item.WarehouseProduct.size}</TableCell>
                <TableCell className="text-center text-xs font-semibold flex items-center justify-center">
                    <p className={`rounded-full shadow-sm px-5 ${item.stockMutation?.type === 'RESTOCK' ? 'bg-green-200 text-green-700' : 'hidden'}`}>Restock</p>
                    <p className={`rounded-full shadow-sm px-5 ${item.stockMutation?.type === 'REMOVE' ? 'bg-red-100 text-red-700' : 'hidden'}`}>Removed</p>
                    <p className={`rounded-full shadow-sm px-5 ${item.stockMutation?.type === 'TRANSFER' ? 'bg-blue-100 text-blue-700' : 'hidden'}`}>Transfer</p>
                    <p className={`rounded-full shadow-sm px-5 ${item.stockMutation?.type === 'INBOUND' ? 'bg-violet-100 text-violet-600' : 'hidden'}`}>Inbound</p>
                    <p className={`rounded-full shadow-sm px-5 ${item.stockMutation?.type === 'DELETE' ? 'bg-gray-100 text-gray-700' : 'hidden'}`}>Deleted</p>
                    <p className={`rounded-full shadow-sm px-5 ${item.stockMutation?.type === 'TRANSACTION' ? 'bg-amber-100 text-amber-700' : 'hidden'}`}>Transaction</p>
                </TableCell>
                <TableCell className={`text-center ${isSuper ? '' : 'hidden'}`}>{item.WarehouseProduct.warehouse?.warehouseName}</TableCell>
                <TableCell className="text-center">{item.associatedWH?.warehouseName}</TableCell>
                <TableCell className={`flex-wrap items-center justify-center gap-x-1 flex`}>
                    {item.stockMutation?.updatedAt ? 
                    <div className={`flex-wrap items-center justify-center gap-x-1 flex`}>
                        <p>{dateU?.date} {dateU?.month} {dateU?.year},</p>
                        <p>{dateU?.hours.toString().padStart(2, '0')}.{dateU?.minute.toString().padStart(2, '0')} WIB</p>
                    </div>
                    :
                    <div className={`flex-wrap items-center justify-center gap-x-1 flex`}>
                        <p>{date?.date} {date?.month} {date?.year},</p>
                        <p>{date?.hours.toString().padStart(2, '0')}.{date?.minute.toString().padStart(2, '0')} WIB</p>
                    </div>
                    }
                </TableCell>
                <TableCell className="text-center font-semibold">{item.quantity}</TableCell>
              </TableRow>
              )
            })
            :
            <TableRow>
              <TableCell className="font-medium text-center" colSpan={8} >Data will appear here.</TableCell>
            </TableRow>
          } 
          </TableBody>
        </Table>
        <PaginationTemplate
        limiter={10}
        setPage={setPage}
        page={page}
        productQty={productQty}
        />
      </div>
    )
  }
  