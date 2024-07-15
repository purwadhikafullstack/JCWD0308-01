"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form, FormControl, FormDescription,
  FormField, FormItem,
  FormLabel, FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PiArrowRight, PiEye, PiEyeClosed, PiX } from "react-icons/pi"
import { postRequest } from "@/lib/fetchRequests"
import { toast } from "sonner"
import { useEffect, useState } from "react"
import { LoadingButton } from "@/components/ui/loading-button"
import { isTokenExp, swipeToNextForm } from "@/lib/utils"
import { useParams } from "next/navigation"
import { jwtDecode } from "jwt-decode"

const formSchema = z.object({
    password: z.string().min(6, 'your password must be at least 6 characters')
})

export function VerifyCurrentPassForm({ className } : { className: string }) {
    const [ isLoading, setIsLoading ] = useState(false);
    const [ currentToken, setCurrentToken ] = useState('');
    const [ passwordHidden, setPasswordHidden ] = useState(false);
    const params = useParams();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { password: "" }
    })

    useEffect(() => {
        const token = params.token.toString();
        setCurrentToken(token)
    }, [])
    
    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true)
        try {
            const isExp = isTokenExp(currentToken)
            if (isExp) {
                toast.error('Token is expired or invalid', { description: 'please request the new one on login page or account page'})
                setTimeout(() => toast('Please request the new one '), 2000);
            } else {
                const decodedToken = jwtDecode(currentToken)
                let accountData : { id: string, password: string } = { id: '', password: '' }
                if (decodedToken) {
                    const { id } : any = decodedToken;
                    accountData = { id: id, password: values.password }
                } else {
                    toast.error('Token is expired or invalid', { description: 'please request the new one on login page or account page'})
                }

                const res = await postRequest(accountData, 'account/check-password')
                if (res) setIsLoading(false)
                if (res.ok) {
                    swipeToNextForm()
                } else {
                    toast.error("Password incorrect", { description: 'try again' })
                }
            }
        } catch (error) {
            setIsLoading(false)
            toast.error("Oops, server might be down", { description: 'or token invalid' })
        }
    }

    return (
        <div id="verify-current-pass-form" className={`p-6 rounded-xl bg-white duration-300 ${ className } `}>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-2xl font-bold text-black flex items-center justify-between">
                                Verify Current Password
                            </FormLabel>
                            <FormDescription>
                                To update your password, please first confirm your current password.
                            </FormDescription>
                            <FormControl>
                                <div className="relative">
                                    <Input 
                                    type={ passwordHidden? "password" : "string" }
                                    className="focus-visible:ring-black/0 focus-visible:border-black/60 duration-200" placeholder="Type your current password here" {...field} />
                                    {
                                        passwordHidden? 
                                        <PiEyeClosed onClick={() => {
                                            setPasswordHidden(!passwordHidden)
                                        }} className="cursor-pointer top-0 bottom-0 m-auto right-2 absolute" size={'1.1rem'} />
                                        :
                                        <PiEye onClick={() => {
                                            setPasswordHidden(!passwordHidden)
                                        }} className="cursor-pointer top-0 bottom-0 m-auto right-2 absolute" size={'1.1rem'} />
                                    }
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <LoadingButton loading={isLoading} type="submit" className="flex gap-2">Next<PiArrowRight /></LoadingButton>
                </form>
            </Form>
        </div>
    )
}
