import { PaginationTemplate } from "@/components/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { IProduct } from "@/constants"
import { DateConvert } from "@/lib/dateConvert"
import Link from "next/link"
import { AiOutlineFileSearch } from "react-icons/ai";

interface IStockTable {
    salesList: IProduct[]
    setPage: React.Dispatch<React.SetStateAction<number>>
    page: number
    productQty: number
  }
  

  
  export function SalesTable({salesList, setPage, page, productQty}:IStockTable) {
    return (
      <div>
        <Table className="my-7 text-[0.82rem]">
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">No.</TableHead>
              <TableHead className="min-w-[100px] md:min-w-[200px]">Product Name</TableHead>
              <TableHead className="text-center">Gender</TableHead>
              <TableHead className="text-center max-w-52">Type</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Transactions</TableHead>
              <TableHead className="text-center min-w-32">Qty Sold</TableHead>
              <TableHead className="text-center">Gross (IDR)</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesList && salesList.length > 0 
            ? 
            salesList.map((item, index) => {
              let date
              if (item.stockUpdatedAt) {
                date = DateConvert(item.stockUpdatedAt)
              }
              return (    
              <TableRow key={item.id}>
                <TableCell>{(index + 1) + ((page - 1) * 10)}</TableCell>
                <TableCell className="font-semibold min-w-[100px] md:min-w-[200px]">{item.name}</TableCell>
                <TableCell className="text-center">{item.category.gender.at(0) + item.category.gender.slice(1).toLowerCase()}</TableCell>
                <TableCell className="text-center">{item.category.type.at(0) + item.category.type.slice(1).toLowerCase()}</TableCell>
                <TableCell className="text-center">{item.category.category}</TableCell>
                <TableCell className="text-center">{item.analytics._count.id}</TableCell>
                <TableCell className="text-center">{item.analytics._sum.quantity}</TableCell>
                <TableCell className="text-center font-semibold">{new Intl.NumberFormat('en-DE').format(item.analytics._sum.price)}</TableCell>
                <TableCell className="text-center">
                  <Link href={`/admins/sales/${item.slug}`} className="flex items-center justify-center bg-secondary text-black gap-1 rounded-sm hover:underline shadow-md">
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
  