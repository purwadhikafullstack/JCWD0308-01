'use client'
import { Button } from "@/components/ui/button"
import { Card, CardTitle, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FcGoogle } from "react-icons/fc";
import { PiArrowUpRight, PiArrowLeft } from "react-icons/pi";
import * as z from 'zod'
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useRouter, useSearchParams } from "next/navigation"
import { postRequest } from "@/lib/fetchRequests"
import { LoadingButton } from "@/components/ui/loading-button"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Cookies from 'js-cookie'
import useAuth from "@/hooks/useAuth"
import { SSOUsernameForm } from "./SSOUsernameForm"

export function AuthCard() {
    const router = useRouter();
    const { googleSSO, SSOUserData } = useAuth();
    const [ isLoading, setIsLoading ] = useState(false);
    const params = useSearchParams()

    async function registerUserFromProvider() {
        const { user } = SSOUserData;
        const userData = {
            accountActive: user.emailVerified, username: user.displayName,
            email: user.email, imgUrl: user.photoURL
        }
        try {
            const res = await postRequest(userData, 'user/create-sso-user');
            const data = await res.json();
            const formDialog = document.getElementById('username-form');
            if (res.status == 200 || res.status == 201) {
                Cookies.set('role', 'user', { expires: 1 })
                Cookies.set('token', data.data.token, { expires: 1 })
                const nextUrl = params.get('redirect')
                if (nextUrl) {
                    toast.success(`Hello, ${userData.username}`, { description: 'Welcome to WearDrobe!' })
                    setTimeout(() => { router.push(nextUrl) }, 2000);
                } else {
                    toast.success(`Hello, ${userData.username}`, { description: 'Welcome to WearDrobe!' })
                    setTimeout(() => { router.push('/') }, 2000);
                }

            } else if (res.status == 409) {
                toast.error("Username has been taken")
                formDialog?.classList.add('flex')
                formDialog?.classList.remove('hidden')
            } else {
                toast.error("Request error")
            }
        } catch (error) {
            toast.error("Server error")
        }
    }

    useEffect(() => {
        if (SSOUserData) {
            registerUserFromProvider()
        }
    }, [ SSOUserData ])

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
            email: '',
            password: ''
        }
    })
    
    async function handleRegister() {
        setIsLoading(true)
        const { email } = registerForm.getValues()
        try {
            const res = await postRequest({ email: email }, 'user')
            if (res) setIsLoading(false)
            if (res.ok) {
                toast.success("Email successfully registered!", { description: "Please check your email to verify account." })
            } else if (res.status == 409) {
                toast.warning("Email has been registered!")
                if (!(await res.json()).data.accountActive) setTimeout(() => { toast("Check your email, to verify your account") }, 2000);
            } else {
                toast.warning("Registration error.", {
                    description: "Please try again later."
                })
            }
            registerForm.reset()

        } catch(error) {
            setIsLoading(false)
            toast.warning("Something went wrong", { description: "server might be down" })
        }
    }

    async function handleLogin() {
        setIsLoading(true)
        try {
            const res = await postRequest(loginForm.getValues(), 'account/login')

            if (res) setIsLoading(false)
            if (res.ok) {
                const data = await res.json();
                const account = data.data.user || data.data.admin;
                Cookies.set('role', data.data.role, { expires: 1 })
                Cookies.set('token', data.data.token, { expires: 1 })
                const nextUrl = params.get('redirect')
                if (nextUrl) {
                    toast.success(`Welcome, ${account.role ? account.fullName : account.username }`, { description: `redirecting you to ${account.role ? 'dashboard' : 'previous page'}..` })
                    setTimeout(() => { router.push(nextUrl) }, 2000);
                } else {
                    toast.success(`Welcome, ${account.role ? account.fullName : account.username }`, { description: `redirecting you to ${account.role ? 'dashboard' : 'homepage'}..` })
                    setTimeout(() => { router.push(account.role ? '/admins/products' : '/' ) }, 2000);
                }
            } else if (res.status == 401) {
                toast.error("Password incorrect")
            } else if (res.status == 404) {
                toast.error("Account not found")
            } else {
                toast.error("Server error", { description: 'please try again later' })
            }

        } catch (error) {
            toast.error("Server error", {
                description: 'please try again later'
            })
        }
    }

    return (
        <Tabs defaultValue="login" className="w-[400px] h-[40rem]">
            <TabsList className="w-full flex gap-2 ">
                <PiArrowLeft onClick={() => router.back()} className="cursor-pointer mx-2 hover:fill-black duration-200" size={`1.3rem`} />
                <div className="w-full flex">
                    <TabsTrigger className="w-full hover:text-black duration-200" value="login">Login</TabsTrigger>
                    <TabsTrigger className="w-full hover:text-black duration-200" value="register">Register</TabsTrigger>
                </div>
            </TabsList>
            
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle>Login</CardTitle>
                        <CardDescription>
                        Sign in with your email for personalized shopping, exclusive sales, smooth checkout, and updates.
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
                                    <Label 
                                        onClick={() => {
                                            document.getElementById('forgot-password-dialog')?.classList.remove('hidden')
                                            document.getElementById('forgot-password-dialog')?.classList.add('flex')
                                        } } 
                                        className="text-blue-600 font-light cursor-pointer">Forgot password?</Label>
                                </div>
                                <LoadingButton loading={isLoading} className="px-10 flex gap-2" type="submit">Login</LoadingButton>
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
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle>Register</CardTitle>
                        <CardDescription>
                            Join WearDrobe with your email for personalized shopping, exclusive sales, seamless checkout, and the latest trends. Don&apos;t miss out!
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
                                    <LoadingButton loading={isLoading} className="px-10 flex gap-2" type="submit">Create New Account
                                        <PiArrowUpRight />
                                    </LoadingButton>
                                </form>
                            </Form>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
                
            <SSOUsernameForm SSOUserData={SSOUserData} router={router} />
        </Tabs>
    )
}
