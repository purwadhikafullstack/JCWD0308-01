/* eslint-disable @next/next/no-img-element */
import { getMutation } from "@/app/action";
import { PaginationTemplate } from "@/components/pagination";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { IMutation } from "@/constants";
import { DateConvert } from "@/lib/dateConvert";
import { useEffect, useState } from "react";
import { PiTrashFill } from "react-icons/pi";

interface IHistoryTable {
  selectedWH: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

  export function RequestHistoryTable({selectedWH, open, setOpen}:IHistoryTable) {
    const [page, setPage] = useState(1)
    const [historyList, setHistoryList] = useState<IMutation[]>([])
    const [productQty, setProductQty] = useState(0)

    useEffect(() => {
      if (selectedWH) {
        const getData = async() => {
          const res = await getMutation(selectedWH, 'inbound', 'completed', page, 5)
          if (res.status == 'ok') {
            setHistoryList(res.data.mutationList)
            setProductQty(res.data.total)
          }
        }
        getData()
      }
    }, [open, page, selectedWH])


    return (
      <div className="my-2">
        <Table className="min-w-[300px] border-b-[1px]">
          <TableHeader>
            <TableRow className="bg-secondary">
              <TableHead className="">No.</TableHead>
              <TableHead className="">Products</TableHead>
              <TableHead className="text-center">Variants</TableHead>
              <TableHead className="text-center">Size</TableHead>
              <TableHead className="text-center">Target Warehouse</TableHead>
              <TableHead className="text-center min-w-32">Created</TableHead>
              <TableHead className="text-center min-w-32">Responded</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            { productQty > 0 ? 
            historyList.map((item, index) => {
              const createD = DateConvert(item.createdAt)
              const updateD = DateConvert(item.updatedAt!)
              return (
              <TableRow className="" key={index}>
                  <TableCell className="font-medium">{index}</TableCell>
                  <TableCell className="font-medium">{item.StockMutationItem[0].WarehouseProduct.productVariant.product?.name}</TableCell>
                  <TableCell className="text-center">{item.StockMutationItem[0].WarehouseProduct.productVariant.color}</TableCell>
                  <TableCell className="text-center">{item.StockMutationItem[0].WarehouseProduct.size}</TableCell>
                  <TableCell className="text-center">{item.associatedWarehouseName}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-center gap-x-1">
                      <p>{createD.date} {createD.month} {createD.year},</p>
                      <p>{createD.hours.toString().padStart(2, '0')}.{createD.minute.toString().padStart(2, '0')} WIB</p>
                    </div>
                    </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center justify-center gap-x-1">
                      <p>{updateD.date} {updateD.month} {updateD.year},</p>
                      <p>{updateD.hours.toString().padStart(2, '0')}.{updateD.minute.toString().padStart(2, '0')} WIB</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.StockMutationItem[0].quantity}</TableCell>
                  <TableCell className="text-center"><p className={`rounded-full px-2 ${item.status === 'ACCEPTED' ? 'bg-green-200 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.status}</p></TableCell>
              </TableRow>
              )             
            })
            :
            <TableRow className="">
                <TableCell className="text-center" colSpan={9}>Requests history will appear here.</TableCell>
            </TableRow>  
          }
          </TableBody>
        </Table>
        <PaginationTemplate page={page} productQty={productQty} setPage={setPage} limiter={5}/>
      </div>
    )
  }
  