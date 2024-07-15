/* eslint-disable @next/next/no-img-element */
import { acceptRequest, getMutationRequest, rejectRequest } from "@/app/action";
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
import { useCallback, useEffect, useState } from "react";
import { PiCheckCircleBold } from "react-icons/pi";
import { PiXCircleBold } from "react-icons/pi";
import { toast } from "sonner";

interface IHistoryTable {
  selectedWH: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
  getQty:() => void
}

  
export function TransferTable({selectedWH, open, setOpen, getQty}:IHistoryTable) {
  const [page, setPage] = useState(1)
  const [transferList, setTransferList] = useState<IMutation[]>([])
  const [productQty, setProductQty] = useState(0)

  const getData = useCallback(async () => {
    const res = await getMutationRequest(selectedWH, 'waiting', page, 5);
    if (res.status === 'ok') {
      setTransferList(res.data.mutationList);
      setProductQty(res.data.total);
    }
  }, [selectedWH, page]);
  
  useEffect(() => {
    if (selectedWH) {
      getData()
    }
  }, [getData, open, page, selectedWH])

  const handleAccept = async (id:string) => {
    const res = await acceptRequest(id)
    
    if (res.status == 'ok') {
      toast.success('Stock successfully transfered.')
      getQty()
      getData()
    } else if (res.message == 'Stock at warehouse is lower than requested amount.') {
      toast.error(res.message)
    } else {
      toast.error('Failed to transfer stock.')
    }
  }
  
  const handleReject = async (id:string) => {
    const res = await rejectRequest(id)
    if (res.status == 'ok') {
      toast.success('Stock transfer request rejected.')
      getData()
      getQty()
    } else {
      toast.error('Failed to reject transfer request.')
    }
  }


  return (
      <div className="">
      <Table className="min-w-[300px]">
        <TableHeader>
          <TableRow className="bg-secondary">
            <TableHead className="text-center"></TableHead>
            <TableHead className="">Products</TableHead>
            <TableHead className="text-center">Variants</TableHead>
            <TableHead className="text-center">Size</TableHead>
            <TableHead className="text-center">Requesting Warehouse</TableHead>
            <TableHead className="text-center min-w-32">Date Created</TableHead>
            <TableHead className="text-center">Qty</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          { productQty > 0 ?
          transferList.map((item, index) => {
            const date = DateConvert(item.createdAt)
            return (
              <TableRow className="" key={index}>
              <TableCell>
                  <div className="flex justify-center items-center gap-1 text-xl">
                    <SubmitAlert 
                    icon={<PiCheckCircleBold className='flex text-green-600 hover:text-green-500 hover:cursor-pointer' />}  
                    title="Approve stock transfer request?"
                    message="Your stock will be mutated to requesting warehouse."
                    action={() => handleAccept(item.id)}
                    />
                    <SubmitAlert 
                    icon={<PiXCircleBold className='flex text-red-400 hover:text-red-300 hover:cursor-pointer' />}  
                    title="Decline stock transfer request?"
                    message="Your stock will remain the same."
                    action={() => handleReject(item.id)}
                    />
                  </div>
              </TableCell>
              <TableCell className="font-medium">{item.StockMutationItem[0].WarehouseProduct.productVariant.product?.name}</TableCell>
              <TableCell className="text-center">{item.StockMutationItem[0].WarehouseProduct.productVariant.color}</TableCell>
              <TableCell className="text-center">{item.StockMutationItem[0].WarehouseProduct.size}</TableCell>
              <TableCell className="text-center">{item.requestingWarehouse}</TableCell>
              <TableCell className="flex flex-wrap items-center justify-center gap-x-1">
                <p>{date.date} {date.month} {date.year},</p>
                <p>{date.hours.toString().padStart(2, '0')}.{date.minute.toString().padStart(2, '0')} WIB</p>
              </TableCell>
              <TableCell className="text-center">{item.StockMutationItem[0].quantity}</TableCell>
          </TableRow>
            )
          })
          :
          <TableRow className="">
                <TableCell className="text-center" colSpan={9}>Transfer requests will appear here.</TableCell>
            </TableRow>  
          }
        </TableBody>
      </Table>
      <PaginationTemplate page={page} productQty={productQty} setPage={setPage} limiter={5}/>
    </div>
  )
}
  