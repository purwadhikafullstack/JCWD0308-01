import React from 'react'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
  } from "@/components/ui/form"
  import { Input } from "@/components/ui/input"

interface INameForm {
  name:string, 
  nameErrorMessage:string, 
  setNameErrorMessage:React.Dispatch<React.SetStateAction<string>>, 
  setName:React.Dispatch<React.SetStateAction<string>>, 
} 
  
export const NameField = ({name, setName, nameErrorMessage, setNameErrorMessage}:INameForm) => {
  function validateName(name: string) {
    const symbolRegex = /[^a-zA-Z0-9\s-]/;
    if (name.length < 2) {
      setNameErrorMessage("Name must be at least 2 characters.");
    } else if (name.length > 30) {
      setNameErrorMessage("Name cannot be longer than 30 characters.");
    } else if (name.trim().length === 0) {
      setNameErrorMessage("Name cannot be only spaces.");
    } else if (symbolRegex.test(name)) {
      setNameErrorMessage(`Only ${"'"} - ${"'"} are allowed.`);
    } else {
      setNameErrorMessage('');
    }
    setName(name);
  }

  return (
    <FormField
      name="name"
      render={() => (
        <FormItem>
          <FormLabel className="font-bold text-base">Product name</FormLabel>
          <div className="flex w-full">
            <FormControl>
              <Input 
                value={name}
                onChange={(e) => validateName(e.target.value)}
                placeholder="ex: Bomber Jacket Purwadhika" 
                className="focus-visible:ring-transparent placeholder:text-xs text-sm grow shrink"
              />
            </FormControl>
          </div>
          <div className={`text-red-500 text-sm font-medium mt-2 ${nameErrorMessage ? "block" : "hidden"}`}>{nameErrorMessage}</div>
        </FormItem>
      )}
    />
  )
}


