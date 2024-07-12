'use client'
import React, { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { PiCheckBold, PiXCircleBold } from "react-icons/pi"
import { ToolTip } from "@/components/Tooltip"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"
import { IAdmin } from "../../_components/columns"

export default function EditableInput({ inputType, data, classNameHead, head, defValue, handleFunc, children, hoverText }: { data: IAdmin | null, classNameHead?: string, head?: string, defValue:any, inputType: string, handleFunc: any, children?: React.ReactNode, hoverText: string }) {

    const [ inputTag, setInputTag ] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    let formattedDate = ``;
    if (data) {
        if (defValue == data?.dob)  {
            const date = new Date(defValue);
            const year = date.getUTCFullYear();
            const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth() returns 0-11
            const day = String(date.getUTCDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
        }
    }

    async function handleSubmit() {
        if (data) {
            setIsLoading(true)
            const res = await handleFunc(inputRef.current?.value)
            if (res) setIsLoading(false)
            if (res.error) {
                setIsLoading(false)
                setInputTag(false)
                toast.error(res.error.message)
            } else if (res.success) {
                setIsLoading(false)
                if (inputType == 'email') {
                    if (res.success.message == "Email didn't change") {
                        toast.success(res.success.message)
                    } else if(res.success.message == "Email has been taken!") {
                        toast.error(res.success.message)
                    } else {
                        toast.success(`An email has been sent to ${data.fullName}'s new email!`)
                        setTimeout(() => {
                            toast(`Please inform ${data.fullName} to check ${ data.gender == 'MALE' ? 'his' : 'her' } new email address to re-verify ${ data.gender == 'MALE' ? 'his' : 'her' } account`)
                        }, 2500);
                    }
                } else {
                    toast.success(res.success.message)
                }
                setInputTag(false)
            }
        }
    }

    return (
        <>
            { head && <span className={`text-black font-semibold ${ classNameHead }`}>{ head }: </span> }
            {
                inputTag ?
                <div className="flex items-center gap-4 grow">
                    <Input className="max-w-40" ref={inputRef} type={inputType} defaultValue={data && defValue == data.dob ? new Date(formattedDate) : defValue} />
                    <div className="flex items-center gap-2">
                        <PiXCircleBold onClick={() => setInputTag(false)} className="cursor-pointer fill-red-400" size={`1.2rem`} />
                        { isLoading ? <Spinner size={`small`} />
                            :
                            <PiCheckBold onClick={handleSubmit} className="cursor-pointer fill-green-400" size={`1.1rem`} />
                        }
                    </div>
                </div>
                :
                <ToolTip content={`Double click to edit ${hoverText}`} >
                    { data && defValue == data?.dob ? 
                        <span onDoubleClick={() => setInputTag(true)} className="cursor-pointer select-none">
                            <span className="hidden lg:block">&nbsp;</span>
                            {new Date(defValue).toLocaleDateString('en-UK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                        :
                            children ? 
                                <div onDoubleClick={() => setInputTag(true)} >
                                    { children }
                                </div>
                            :
                            <span onDoubleClick={() => setInputTag(true)} className="cursor-pointer select-none flex items-center">
                                <span className="hidden lg:block">&nbsp;</span>
                                {data && data?.email ? data?.email : ''}</span>
                    }
                </ToolTip>
            }
        </>
    )
};

