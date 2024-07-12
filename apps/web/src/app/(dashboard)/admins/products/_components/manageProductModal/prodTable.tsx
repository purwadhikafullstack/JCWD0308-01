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
import { IProduct } from "@/constants";
import { EditProductDialog } from "./editProductDialog";
import { SubmitAlert } from "../../../../../../components/submitAlertTemplate";
import { PiTrashFill } from "react-icons/pi";
import { deleteProduct } from "@/app/action";
import { toast } from "sonner";
import { DateConvert } from "@/lib/dateConvert";

interface IProdTable {
  productList: IProduct[]
  action:()=>void
  isSuper: boolean
  page: number
}
  
  export function ProdTable({productList, action, isSuper, page}:IProdTable) {
    const handleDelete = async(slug:string) => {
      try {
        const data = await deleteProduct(slug)
        if (data.status === "ok") {
          action()
          toast.success("Product deleted.")
        } else if (data.status === "error") {
          toast.error("Failed to delete product.")
        }
      } catch (error) {
        console.log(error);
      }
    }
    
    
    return (
      <Table className="my-7 text-[0.82rem]">
        <TableHeader>
          <TableRow>
            <TableHead className={`${isSuper ? '' : 'hidden'}text-center`}></TableHead>
            <TableHead className="min-w-[100px] sm:min-w-[200px]">Product Name</TableHead>
            {/* <TableHead className="text-center min-w-[100px] sm:min-w-[200px]">Product ID</TableHead> */}
            <TableHead className="text-center">Gender</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-center">Category</TableHead>
            <TableHead className="text-center min-w-32">Created</TableHead>
            <TableHead className="text-center min-w-32">Updated</TableHead>
            <TableHead className="text-center">Variants</TableHead>
            <TableHead className="text-center min-w-28">Size</TableHead>
            <TableHead className="text-center">Price (IDR)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {productList && productList.length > 0 ? 
            productList.map((product, index) => {
            const date = DateConvert(product.createdAt)
            let dateU 
            if (product.updatedAt) {
              dateU = DateConvert(product.updatedAt)
            }
            return(
            <TableRow key={index + ((page - 1) * 10)}>
              <TableCell className={`${isSuper ? '' : 'hidden'}text-center`}>
                <div className="flex gap-2">
                  <EditProductDialog 
                    slug={product.slug}
                    action={() => action()}
                    isSuper={isSuper}
                    />
                  <SubmitAlert 
                    action={() => handleDelete(product.slug)} 
                    hidden={isSuper ? false : true}
                    icon={<PiTrashFill className='flex hover:cursor-pointer text-xl text-red-400 hover:text-red-500' />} 
                    title={"Delete product?"} 
                    message={
                        <>
                            <p>Product and its stock data will be permanently deleted. This action cannot be undone.</p>
                            <br />
                            <p>If you want to hide the product, change its visibility instead.</p>
                        </>
                    }
                  />
                </div>
              </TableCell>
              <TableCell className="text-pretty font-semibold min-w-[100px] sm:min-w-[200px]">{product.name}</TableCell>
              {/* <TableCell className="min-w-[100px] sm:min-w-[200px]">{product.id}</TableCell> */}
              <TableCell className="text-center">{product.category.gender.toLocaleLowerCase()}</TableCell>
              <TableCell className="text-center">{product.category.type.toLocaleLowerCase()}</TableCell>
              <TableCell className="text-center">{product.category.category}</TableCell>

              <TableCell>
                <div className={`flex-wrap items-center justify-center gap-x-1 text-center`}>
                  <p>{date.date} {date.month} {date.year},</p>
                  <p>{date.hours.toString().padStart(2, '0')}.{date.minute.toString().padStart(2, '0')} WIB</p>
                </div>
              </TableCell>
              
              <TableCell>
                {product.updatedAt? 
                  <div className={`flex-wrap items-center justify-center gap-x-1 ${product.updatedAt? "flex" : "hidden"}`}>
                    <p>{dateU?.date} {dateU?.month} {dateU?.year},</p>
                    <p>{dateU?.hours.toString().padStart(2, '0')}.{dateU?.minute.toString().padStart(2, '0')} WIB</p>
                  </div>
                  :
                  <div className={`text-center ${product.updatedAt? "hidden" : "block"}`}>-</div>
                }
              </TableCell>
              
              <TableCell className="">
                <div className=" flex flex-wrap gap-1 text-center text-xs justify-center items-center">  
                  {
                  product.variants.map(item => {
                    const brightColor = ["D", 'E', 'F']
                    const textColor = brightColor.includes(item.HEX.slice(1,2).toUpperCase())
                    const borderColor = (item.HEX.slice(3, 4).toUpperCase() === 'F')
                    return (
                      <div 
                        key={item.id} style={{ background: `${item.HEX}` }} 
                        className={`flex px-2 ${borderColor? "border-[1px] border-black rounded-full": 'rounded-full'}`} >
                        <p className={textColor ? "text-black" : 'text-white'}>{item.color}</p>
                      </div>
                    )
                  })
                  }
                </div>
              </TableCell>
              <TableCell className="text-center">{product.oneSize ? "One Size" : "S M L XL"}</TableCell>
              <TableCell className="text-center font-semibold">{new Intl.NumberFormat('en-DE').format(product.price)}</TableCell>
            </TableRow>
          )})
        : 
        <TableRow>
            <TableCell className="text-center" colSpan={13} >No results.</TableCell>
        </TableRow>
        }
        </TableBody>
      </Table>
    )
  }
  