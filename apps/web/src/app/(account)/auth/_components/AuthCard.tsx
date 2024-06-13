'use client'
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";
import { PiArrowUpRight, PiArrowLeft } from "react-icons/pi";
import { googleSSO, facebookSSO } from "@/lib/loginSSO"
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter } from "next/navigation"
import { postRequest } from "@/lib/fetchRequests"
import { LoadingButton } from "@/components/ui/loading-button"
import { useState } from "react"
import { toast } from "sonner"

export function AuthCard() {
    const router = useRouter();
    const [ isLoading, setIsLoading ] = useState(false);

    const regFormSchema = z.object({
        email: z.string().email()
    })

    const loginFormSchema = z.object({
        email: z.string().email(),
        password: z.string().min(6)
    })

    const registerForm = useForm<z.infer<typeof regFormSchema>>({
        resolver: zodResolver(regFormSchema),// if the input value changes, zodResolver will revalidate the value
        defaultValues: {
            email: ""
        }
    })

    const loginForm = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: ''
        }
    })
    
    async function handleRegister() {
        setIsLoading(true)
        const { email } = registerForm.getValues()
        try {
            const res = await postRequest({ email: email }, '/user')
            if (res.ok) {
                setIsLoading(false)
                const data = await res.json();
                toast.success("Email successfully registered!", {
                    description: "Please check your email to verify account."
                })
            } else if (res.status == 409) {
                setIsLoading(false)
                toast.error("Email has already been existed!")
            } else {
                setIsLoading(false)
                toast.warning("Registration error.", {
                    description: "Please try again later."
                })
            }

        } catch(error) {
            setIsLoading(false)
            toast.warning("Server error", {
                description: "Please start the server."
            })
        }
    }

    async function handleLogin() {
        console.log('handleLogin:')
        setIsLoading(true)
        const { email, password } = loginForm.getValues()
        try {
            const res = await postRequest({ email: email, password: password }, '/login')
            console.log(res)

            if (res.ok) {
                const data = await res.json()
                console.log(data)
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <Tabs defaultValue="login" className="w-[400px]  h-[40rem]">
            <TabsList className="w-full flex gap-2 ">
                <PiArrowLeft onClick={() => router.back()} className="cursor-pointer mx-2 hover:fill-black duration-200" size={`1.3rem`} />
                <div className="w-full flex">
                    <TabsTrigger className="w-full hover:text-black duration-200" value="login">Login</TabsTrigger>
                    <TabsTrigger className="w-full hover:text-black duration-200" value="register">Register</TabsTrigger>
                </div>
            </TabsList>
            
            <TabsContent className="" value="login">
                <Card>
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Log in to WearDrobe with your email for personalized shopping, exclusive sales, seamless checkout, and the latest updates.
                    </CardDescription>
                </CardHeader>
                <CardContent >
                    <Form {...loginForm}>
                        <form className="flex flex-col gap-4" onSubmit={loginForm.handleSubmit(handleLogin)}>
                            <FormField
                                control={loginForm.control}
                                name="email"
                                render={({ field }) => {
                                    return (
                                        <FormItem>
                                            <FormLabel className="text-black">Email</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    placeholder="@example: brucewayne@gmail.com"
                                                    type="email"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )
                                }}
                            />
                            <div className="flex flex-col gap-2">
                                <FormField
                                    control={loginForm.control}
                                    name="password"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="text-black">Password</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="password"
                                                        type="password"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )
                                    }}
                                />
                                <Label className="text-blue-600 font-light cursor-pointer">Forgot password?</Label>
                            </div>
                            {
                                isLoading ? 
                                <LoadingButton loading className="px-10 flex gap-2" type="submit">Login</LoadingButton>
                                :
                                <Button className="px-10 flex gap-2" type="submit">Login</Button>
                            }
                        </form>
                    </Form>
                </CardContent>
                <div className="flex px-6 mb-4 items-center">
                    <div className="bg-black/30 h-[1px] w-full"></div>
                    <span className="mx-4 text-black/30">or</span>
                    <div className="bg-black/30 h-[1px] w-full"></div>
                </div>
                <CardContent className="flex flex-col gap-2">
                    <Button onClick={googleSSO} className="bg-white text-black border-[1px] border-black/20 flex gap-2 hover:text-white">Login with Google <FcGoogle /> </Button>
                    <Button onClick={facebookSSO} className="bg-white text-black border-[1px] border-black/20 flex gap-2 hover:text-white">Login with Facebook <FaFacebook /> </Button>
                </CardContent>
                </Card>
            </TabsContent>

            <TabsContent className=" min-w-" value="register">
                <Card>
                <CardHeader>
                    <CardTitle>Register</CardTitle>
                    <CardDescription>
                        Sign up at WearDrobe with your email for personalized shopping, exclusive sales, seamless checkout, and the latest updates. Join now!
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="space-y-1">
                        <Form {...registerForm}>
                            <form className="flex flex-col gap-10" onSubmit={registerForm.handleSubmit(handleRegister)}>
                                <FormField
                                    control={registerForm.control}
                                    name="email"
                                    render={({ field }) => {
                                        return (
                                            <FormItem>
                                                <FormLabel className="text-black">Email</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="@example: barryallen@gmail.com"
                                                        type="email"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )
                                    }}
                                />
                                {
                                    isLoading ? 
                                    <LoadingButton loading className="px-10 flex gap-2" type="submit">Create New Account
                                        <PiArrowUpRight />
                                    </LoadingButton>
                                    :
                                    <Button className="px-10 flex gap-2" type="submit">Create New Account
                                        <PiArrowUpRight />
                                    </Button>
                                }
                            </form>
                        </Form>
                    </div>
                </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    )
}