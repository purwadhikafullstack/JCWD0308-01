import React, { SetStateAction } from 'react'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"

export const SizingField = ({isOneSize, setIsOneSize}: {isOneSize:boolean, setIsOneSize:React.Dispatch<React.SetStateAction<boolean>>}) => {
  return (
    <FormField
      name="sizing"
      render={() => (
        <FormItem>
          <div className=''>
            <FormLabel className="font-bold text-base">Sizing</FormLabel>
          </div>
          <div className="flex">
            <FormControl>
              <div className='flex gap-2 w-full max-sm:justify-center items-center'>
                <Switch
                  className='focus-visible:border-[1px] focus-visible:border-black focus-visible:ring-transparent'
                  checked={isOneSize}
                  onCheckedChange={(checked) => {
                    setIsOneSize(checked);
                  }}
                />
                <p className='text-base'>One size</p>
              </div>
            </FormControl>
          </div>
          <p className='text-xs text-gray-500'>{isOneSize ? "product has no size option" : "size: S, M, L, XL"}</p>
        </FormItem>
      )}
    />
  )
}
