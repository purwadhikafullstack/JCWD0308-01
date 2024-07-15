'use client'
import React, { useState } from 'react'
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { CircleProgress } from "@/components/ui/progress"

interface IDescForm {
    description: string, 
    setDescription: React.Dispatch<React.SetStateAction<string>>, 
    descErrorMessage: string, 
    setDescErrorMessage: React.Dispatch<React.SetStateAction<string>>
}

export const DescriptionField = ({description, setDescription, descErrorMessage, setDescErrorMessage}: IDescForm) => {
    function validateDesc(desc:string) {
        if (desc.length < 15) {
          setDescErrorMessage("Description must be at least 15 characters.");
        } else if (desc.length > 500) {
          setDescErrorMessage("Description cannot be longer than 500 characters.");
        } else if (desc.trim().length === 0) {
          setDescErrorMessage("Description cannot be only spaces.");
        } else {
          setDescErrorMessage('')
        }
        setDescription(desc)
      }
  return (
    <FormField
      name="description"
      render={() => (
        <FormItem>
          <div className="flex items-center max-sm:justify-center gap-2">
            <FormLabel className="font-bold text-base">Product description</FormLabel>
            <CircleProgress value={description.length} unit="" max={500} className="w-6 h-6 text-[0.5rem]"/>
          </div>
          <div className="flex">
            <FormControl>
              <Textarea 
                value={description}
                placeholder="ex: A minimalist yet elegant bomber with our signature design on the back." 
                className="focus-visible:ring-transparent placeholder:text-xs text-sm h-48 resize-none grow shrink"
                onChange={(e) => {validateDesc(e.target.value)}}
                />
            </FormControl>
          </div>
          <div className={`text-red-500 text-sm font-medium mt-2 ${descErrorMessage ? "block" : "hidden"}`}>{descErrorMessage}</div>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
