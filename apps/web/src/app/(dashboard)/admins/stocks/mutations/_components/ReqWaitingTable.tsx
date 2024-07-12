import { cancelRequest, getMutation } from "@/app/action";
import { PaginationTemplate } from "@/components/pagination";
import { SubmitAlert } from "@/components/submitAlertTemplate";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { IMutation } from "@/constants";
import { DateConvert } from "@/lib/dateConvert";
import React, {  useEffect, useState } from "react";
import { PiTrashFill } from "react-icons/pi";
import { toast } from "sonner";

interface IRequestTable {
  selectedWH: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
  
  export function RequestTable({selectedWH, open, setOpen}:IRequestTable) {
    const [page, setPage] = useState(1)
    const [waitingList, setWaitingList] = useState<IMutation[]>([])
    const [productQty, setProductQty] = useState(0)

    const getData = async() => {
        const res = await getMutation(selectedWH, 'inbound', 'waiting', page, 5)
        if (res.status == 'ok') {
          setWaitingList(res.data.mutationList)
          setProductQty(res.data.total)
        }
      }

    const handleCancel = async (id:string) => {
      const res = await cancelRequest(id)
      if (res.status == 'ok') {
        toast.success('Request successfully deleted.')
        getData()
      } else {
        toast.error('Failed to delete request.')
      }
    } 

    useEffect(() => {
      if (selectedWH) {
        getData()
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
              <TableHead className="text-center min-w-32">Date Created</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productQty > 0 ? 
              waitingList.map((item, index) => {
              const date = DateConvert(item.createdAt)
              return (
              <TableRow className="" key={index}>
                  <TableCell className="font-medium">{index}</TableCell>
                  <TableCell className="font-medium">{item.StockMutationItem[0].WarehouseProduct.productVariant.product?.name}</TableCell>
                  <TableCell className="text-center">{item.StockMutationItem[0].WarehouseProduct.productVariant.color}</TableCell>
                  <TableCell className="text-center">{item.StockMutationItem[0].WarehouseProduct.size}</TableCell>
                  <TableCell className="text-center">{item.associatedWarehouseName}</TableCell>
                  <TableCell className="flex flex-wrap items-center justify-center gap-x-1"><p>{date.date} {date.month} {date.year},</p><p>{date.hours.toString().padStart(2, '0')}.{date.minute.toString().padStart(2, '0')} WIB</p></TableCell>
                  <TableCell className="text-center">{item.StockMutationItem[0].quantity}</TableCell>
                  
                  <TableCell>
                      <SubmitAlert 
                      action={() => handleCancel(item.id)}
                      message="Request will be deleted."
                      title="Delete stock mutation request?"
                      icon={<PiTrashFill className='flex text-red-400 hover:text-red-500' />}
                      />
                  </TableCell>
              </TableRow>
              )
            })
          : 
          <TableRow className="">
                <TableCell className="text-center" colSpan={7}>Mutation requests will appear here.</TableCell>
            </TableRow>
          }
          </TableBody>
        </Table>
        <PaginationTemplate page={page} productQty={productQty} setPage={setPage} limiter={5}/>
      </div>
    )
  }
  