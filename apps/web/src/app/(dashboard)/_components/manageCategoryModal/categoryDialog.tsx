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
import { Button } from "@/components/ui/button";

export function ManageCategoryDialog({isSuper, setOpenC, openC }:{isSuper:boolean, setOpenC:React.Dispatch<React.SetStateAction<boolean>>, openC:boolean}) {
  return (
    <Dialog open={openC} onOpenChange={setOpenC}>
      <DialogTrigger asChild>
        <Button className={`${isSuper ? '' : 'hidden'} h-7 items-center gap-1 max-sm:text-xs hover:cursor-pointer`}>
            <p>Manage</p>
            <PiArrowSquareOut />      
        </Button>
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
