import { PaginationTemplate } from "@/components/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { IOrderItem2 } from "@/constants"
import { DateConvert } from "@/lib/dateConvert"

interface IStockTable {
  salesData: IOrderItem2[]
    setPage: React.Dispatch<React.SetStateAction<number>>
    page: number
    productQty: number
  }
  

  
  export function SalesDetailTable({salesData, setPage, page, productQty}:IStockTable) {
    return (
      <div>
        <Table className="my-7">
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead className="max-w-[150px]">Invoice ID</TableHead>
              <TableHead className="">Variants</TableHead>
              <TableHead className="text-center">Size</TableHead>
              <TableHead className="max-w-[150px] text-center">User ID</TableHead>
              <TableHead className="text-center">Date</TableHead>
              <TableHead className="text-center min-w-32">City Destination</TableHead>
              <TableHead className="text-center max-w-52">Quantity</TableHead>
              <TableHead className="text-center">Gross</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesData && salesData.length > 0 
            ? 
            salesData.map((item, index) => {
              const date = DateConvert(item.updatedAt)
              return (    
              <TableRow key={item.id}>
                <TableCell>{(index + 1) + ((page - 1) * 10)}</TableCell>
                <TableCell className="truncate max-w-[150px] ">{item.orderId}</TableCell>
                <TableCell className="text-center">{item.productVariant.color}</TableCell>
                <TableCell className="text-center">{item.size}</TableCell>
                <TableCell className="truncate max-w-[150px] text-center">{item.order.userId}</TableCell>
                <TableCell className="flex flex-wrap items-center justify-center gap-x-1">
                  <div className="flex flex-wrap items-center justify-center gap-x-1">
                    <p>{date.date} {date.month} {date.year},</p>
                    <p>{date.hours.toString().padStart(2, '0')}.{date.minute.toString().padStart(2, '0')} WIB</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">{item.order.user?.addresses[0].city_name}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-center font-semibold">{new Intl.NumberFormat('en-DE').format(item.price)}</TableCell>
              </TableRow>
              )
            })
            :
            <TableRow>
              <TableCell className="text-center" colSpan={10} >No results.</TableCell>
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
  