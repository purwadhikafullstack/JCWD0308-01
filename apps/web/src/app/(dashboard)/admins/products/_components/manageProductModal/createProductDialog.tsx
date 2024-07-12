'use client'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { PiArrowSquareOut } from "react-icons/pi"
import { CreateProductForm } from "./createProductForm"
import { useState } from "react";
import { Button } from "@/components/ui/button";
  
  export function CreateProductDialog({open, setOpen,isSuper}:{open:boolean, isSuper:boolean, setOpen:React.Dispatch<React.SetStateAction<boolean>>}) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className={`${isSuper ? '' : 'hidden'} h-7 items-center gap-1 max-sm:text-xs hover:cursor-pointer`}>
              <p>Create</p>
              <PiArrowSquareOut />      
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-sm:h-full max-sm:min-w-full gap-0  min-w-full sm:min-w-[85%] lg:min-w-[800px] focus-visible:outline-none">
          <AlertDialogHeader>
            <AlertDialogTitle className='text-3xl'>Create Products</AlertDialogTitle>
            <AlertDialogDescription>
              Create new products details.
            </AlertDialogDescription>
            <CreateProductForm 
            setOpen={setOpen}
            />
          </AlertDialogHeader>
          

        </AlertDialogContent>
      </AlertDialog>
    )
  }
  