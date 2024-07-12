import { PaginationTemplate } from "@/components/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { IProduct, IWarehouse } from "@/constants"
import { DateConvert } from "@/lib/dateConvert"
import Link from "next/link"
import { AiOutlineFileSearch } from "react-icons/ai";

interface IStockTable {
    productList: IProduct[]
    setPage: React.Dispatch<React.SetStateAction<number>>
    page: number
    productQty: number
  }
  

  
  export function StockTable({productList, setPage, page, productQty}:IStockTable) {
    return (
      <div>
        <Table className="my-7 text-[0.82rem]">
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead className="">Product Name</TableHead>
              {/* <TableHead className="">Product ID</TableHead> */}
              <TableHead className="text-center">Gender</TableHead>
              <TableHead className="text-center max-w-52">Type</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center min-w-32">Last Updated</TableHead>
              <TableHead className="text-center">Stock In</TableHead>
              <TableHead className="text-center">Stock Out</TableHead>
              <TableHead className="text-center">Stock at Date</TableHead>
              <TableHead className="text-center">Current Stock</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productList && productList.length > 0 
            ? 
            productList.map((item, index) => {
              let date
              if (item.stockUpdatedAt) {
                date = DateConvert(item.stockUpdatedAt)
              }
              return (    
              <TableRow key={item.id}>
                <TableCell>{(index + 1) + ((page - 1) * 10)}</TableCell>
                <TableCell className="font-semibold">{item.name}</TableCell>
                {/* <TableCell className="">{item.id}</TableCell> */}
                <TableCell className="text-center">{item.category.gender.at(0) + item.category.gender.slice(1).toLowerCase()}</TableCell>
                <TableCell className="text-center">{item.category.type.at(0) + item.category.type.slice(1).toLowerCase()}</TableCell>
                <TableCell className="text-center">{item.category.category}</TableCell>
                <TableCell className={`text-center ${item.stockUpdatedAt? "hidden" : "block"}`}>no data</TableCell>
                <TableCell className={`${item.stockUpdatedAt? "" : "hidden"}`}>
                  <div className={`flex-wrap items-center justify-center gap-x-1 flex`}>
                    <p>{date?.date} {date?.month} {date?.year},</p><p>{date?.hours.toString().padStart(2, '0')}.{date?.minute.toString().padStart(2, '0')} WIB</p>
                  </div>
                </TableCell>
                <TableCell className="text-center text-green-500">{item.stockIn._sum.quantity? '+': ''}{item.stockIn._sum.quantity}</TableCell>
                <TableCell className="text-center text-red-500">{item.stockOut._sum.quantity? '-': ''}{item.stockOut._sum.quantity}</TableCell>
                <TableCell className="text-center">{item.toDateStock}</TableCell>
                <TableCell className="text-center font-semibold">{item.totalStock}</TableCell>
                <TableCell className="text-center">
                  <Link href={`/admins/stocks/${item.slug}`} className="flex items-center justify-center bg-secondary text-black gap-1 rounded-sm hover:underline shadow-md">
                    <p>Details</p>
                    <AiOutlineFileSearch />
                  </Link>
                </TableCell>
              </TableRow>
              )
            })
            :
            <TableRow>
              <TableCell className="text-center" colSpan={11} >No results.</TableCell>
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
  