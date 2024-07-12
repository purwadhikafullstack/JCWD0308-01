import * as React from "react"
import { Input } from "@/components/ui/input"
import { PiGlobeHemisphereWestDuotone } from "react-icons/pi";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator";
import { useDebouncedCallback } from "use-debounce";

interface IStockSelector {
    label:string
    state:any
    defValue?:string
    setState:any
    disabled?:boolean
    width?:string
    setSearch: React.Dispatch<React.SetStateAction<string>>
}

export function StockSelector({label, state, defValue, setState, disabled, width, setSearch}:IStockSelector) {   

    const debounced = useDebouncedCallback(
        (value) => {
            setSearch(value);
            },
            500
        )
  return (
    <Select value={defValue} onValueChange={(value) => { if (state.length > 0) setState(value)}} disabled={disabled ? disabled : state.length == 0 ? true : false}>
      <SelectTrigger className={`focus:ring-transparent  focus-visible:border-[1px] focus-visible:border-black max-sm:text-xs text-sm truncate ${width}`}>
        <SelectValue placeholder={label}/>
      </SelectTrigger>
      <SelectContent>
        <Input 
            type="text" 
            placeholder="Search" 
            className="w-full"
            onChange={(e) => {debounced(e.target.value)}}
            />
        
          {state.map((item:any, index:number) => {
            return (
              <div key={index}>
                <SelectItem  
                value={item} 
                >
                  <div className="flex items-center gap-2">
                    <p>{item}</p>
                  </div>
                </SelectItem>
              </div>
            )
          })}
      </SelectContent>
    </Select>
  )
}
