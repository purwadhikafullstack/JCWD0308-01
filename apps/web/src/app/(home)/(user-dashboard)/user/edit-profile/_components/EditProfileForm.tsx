'use client'
import React, { useState } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { DatePicker } from "@/app/(account)/(account-setup)/verify/_components/DatePicker"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { PiFloppyDiskBold } from "react-icons/pi"
import { SelectGroup, SelectLabel } from "@/components/ui/select"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { LoadingButton } from "@/components/ui/loading-button"
import { toast } from "sonner"
import { patchRequest } from "@/lib/fetchRequests"

export enum Gender { MALE = 'MALE', FEMALE = 'FEMALE' }

export interface IUser {
    id: string; accountActive: boolean;
    username?: string | null | undefined; email: string; password?: string | null | undefined;
    gender?: Gender | null | undefined; dob?: Date | null | undefined;
    createdAt: Date; imgUrl?: string | null | undefined;
}

export default function EditProfileForm({ user } : { user: IUser }) {
    const [ isLoading, setIsLoading ] = useState(false)
    const [ isDisabled, setIsDisabled ] = useState(true)

    const userProfileSchema = z.object({
        username: z.string().trim().min(6, "username must at least contain 6 characters"),
        email: z.string().trim(),
        dob: z.date({ required_error: "A date of birth is required." }).optional(),
        gender: z.enum([Gender.MALE, Gender.FEMALE], {required_error: "Gender is required"}).optional(),
    });
    
    const userProfileForm = useForm<z.infer<typeof userProfileSchema>>({
        resolver: zodResolver(userProfileSchema),
        defaultValues: {
            username: user.username ?? undefined, 
            email: user.email ?? undefined, 
            dob: user.dob ? new Date(user.dob) : undefined, 
            gender: user.gender ?? undefined
        }
    });

    async function handleUserProfile(values: z.infer<typeof userProfileSchema>) {
        setIsLoading(true)
        
        const currentData = { username: user.username, email: user.email, gender: user.gender, dob: user.dob }
        const newData = { username: values.username, email: values.email, gender: values.gender, dob: values.dob instanceof Date ? values.dob.toISOString() : values.dob }
        const keys: (keyof typeof currentData)[] = ["username", "email", "gender", "dob"]
        type UserDataKeys = "username" | "email" | "dob" | "gender";
        const changedData: Partial<Record<UserDataKeys, any>> = {};
        keys.forEach(key => {
            if (currentData[key] !== newData[key]) {
                changedData[key] = newData[key];
            }
        });

        try {
            if ((changedData.dob || changedData.username) || (changedData.gender || changedData.email)) {
                const res = await patchRequest(changedData, `/user/personal/${user.id}`)
                if (res) setIsLoading(false)
                const data = await res.json()
                if (res.ok) {
                    toast.success(data.message)
                    if (changedData.email) {
                        setTimeout(() => {
                            toast("We've sent a verification email to your new email address", { description: "Please check your inbox to re-verify your account." })
                        }, 2500);
                    }
                } else {
                    toast.error(data.message)
                }
            } else {
                setIsLoading(false)
                toast.warning("You haven't made any change")
            }
        } catch (error) {
            setIsLoading(false)
            toast.warning("Something went wrong", { description: "server might be down" })
        }
    }

    return (
        <div className="flex justify-between flex-col h-96 max-lg:h-full">
            <Form {...userProfileForm} >
                <form className="h-full flex flex-col lg:justify-between gap-10" onSubmit={userProfileForm.handleSubmit(handleUserProfile)}>
                    <div className="flex flex-col gap-4">
                        <FormField
                            control={userProfileForm.control}
                            name="username"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <div className="input-layout-user-profile">
                                            <FormLabel className="text-black">Username</FormLabel>
                                            <FormControl>
                                                <Input
                                                    className="input-width-user-profile"
                                                    style={{marginTop: '0'}}
                                                    placeholder="@example: batman666"
                                                    type="text"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField disabled={user && !user.password ? true : false}
                            control={userProfileForm.control}
                            name="email"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <div className="input-layout-user-profile">
                                            <FormLabel className="text-black">Email</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    className="input-width-user-profile"
                                                    style={{marginTop: '0'}}
                                                    placeholder="@example: brucewayne@gmail.com"
                                                    type="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                        </div>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={userProfileForm.control}
                            name="gender"
                            render={({ field }) => {
                                return (
                                    <FormItem>
                                        <div className="input-layout-user-profile">
                                            <FormLabel className="text-black">Gender</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="input-width-user-profile" style={{marginTop: '0'}}>
                                                        <SelectValue placeholder="Select your gender" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent >
                                                    <SelectGroup>
                                                        <SelectItem value="MALE">Male</SelectItem>
                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <FormMessage/>
                                    </FormItem>
                                )
                            }}
                        />
                        <FormField
                            control={userProfileForm.control}
                            name="dob"
                            render={({ field }) => {
                                return (
                                    <FormItem className="flex flex-col">
                                        <div className="input-layout-user-profile">
                                            <FormLabel className="text-black">Date of birth</FormLabel>
                                            <DatePicker className="input-width-user-profile" field={field} />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    </div>

                    <span className="text-black/60 text-xs">*Changing your email will be required you to re-verify your account</span>
                    
                    <div className="flex sm:justify-end justify-center">
                        <LoadingButton loading={isLoading ? true: false} className="px-10 flex items-center gap-2 w-fit" type="submit">Save Change<PiFloppyDiskBold size={`1rem`}/></LoadingButton>
                        {/* <AlertDialog>
                            <AlertDialogTrigger disabled={isDisabled ? true: false} className={`${ isDisabled ? 'cursor-not-allowed' : 'cursor-default' } bg-black px-10 py-2 text-white rounded-lg hover:bg-black/80 font-medium flex items-center gap-2`}>Save Change<PiFloppyDiskBold size={`1rem`}/>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure you want to update your personal information?</AlertDialogTitle>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <LoadingButton loading={isLoading ? true: false} className="px-10 flex items-center gap-2 w-fit" type="submit">Save Change</LoadingButton>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog> */}
                    </div>
                </form>
            </Form>
        </div>
    )
};

