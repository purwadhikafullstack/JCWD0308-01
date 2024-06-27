import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PiArrowSquareOut } from "react-icons/pi"
import { ManageCategoryList } from "./categoryTypeList";

export function ManageCategoryDialog({isSuper}:{isSuper:boolean}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`flex items-center gap-1 border-b-2 max-sm:text-xs max-sm:border-b-[1px] border-b-black hover:bg-gray-100 hover:cursor-pointer`}>
            <p>{isSuper ?"Manage" : 'See list'}</p>
            <PiArrowSquareOut />
        </div>
      </DialogTrigger>
      <DialogContent className="h-full max-sm:min-w-full sm:h-[700px] gap-0">
        
        <DialogHeader>
          <DialogTitle className='text-3xl'>Manage Categories</DialogTitle>
          <DialogDescription>
            Click category to manage.
          </DialogDescription>
        </DialogHeader>
        
        <ManageCategoryList isSuper={isSuper}/>
        
      </DialogContent>
    </Dialog>
  )
}
