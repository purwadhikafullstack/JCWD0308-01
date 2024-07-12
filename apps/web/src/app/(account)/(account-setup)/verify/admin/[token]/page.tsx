'use client'
import React, { useEffect, useState } from "react"
import { SetupAccountDialog } from "../../_components/SetupAccountDialog";
import SetupAdminAccountForm from "../_components/SetupAdminAccountForm";
import { PiArrowRight, PiCheckCircleBold, PiEye, PiEyeClosed } from "react-icons/pi";
import { Spinner } from "@/components/ui/spinner";
import { useParams, useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { getRequest, getRequestToken, refreshToken } from "@/lib/fetchRequests";
import { isTokenExp } from "@/lib/utils";
import { toast } from "sonner";
import { IAdmin } from "@/app/(dashboard)/admins/admins/_components/columns";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";

export default function Page() {
    const params = useParams()
    const router = useRouter()
    const [ onlyVerify, setOnlyVerify ] = useState(true);
    const [ verified, setVerified ] = useState(false);
    const [ activeToken, setActiveToken ] = useState<string>('')
    const [ decodedToken, setDecodedToken ] = useState<{ exp: number, iat: number, id: string, role: string } | undefined>()
    const [ admin, setAdmin ] = useState<IAdmin | null>();
    const [ currentPassword, setCurrentPassword ] = useState('')
    const [ isLoading, setIsLoading ] = useState(false);
    const [ isHidden, setIsHidden ] = useState(true);

    useEffect(() => {
        const token = params.token.toString();
        const decodedToken : undefined | { exp: number, iat: number, id: string, role: string } = jwtDecode(token);
        if (token && decodedToken) setActiveToken(token); setDecodedToken(decodedToken)

        async function getAdmin() {
            try {
                if (decodedToken) {
                    const data = await (await getRequest(`admin/${decodedToken.id}`)).json()
                    if (data.data) setAdmin(data.data)
                }
            } catch (error) {
                console.log(error)
            }
        }
        getAdmin();

    }, [])

    useEffect(() => {
        if (admin) {
            if ((admin.fullName && admin.password) && (admin.dob && admin.gender)) {
                setOnlyVerify(true)
            } else setOnlyVerify(false)
        } 

        const isExp = isTokenExp(activeToken)
        async function requestNewToken() {
            const newToken = await refreshToken(decodedToken?.id)
            setActiveToken(newToken)
        }
        if (isExp && decodedToken?.id) requestNewToken()
        
    }, [ admin ])

    async function handleSubmit() {
        setIsLoading(true)
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}admin/re-verify-account`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${activeToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: currentPassword })
            })
            const data = await res.json()
            if (res.ok) {
                toast.success(data.message)
                router.push('/admins/edit-profile')
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Error submitting your password!')
        } finally {
            setIsLoading(false)
        }
    }
    
    return (
        <>
            {
                onlyVerify ? 
                    verified ?
                        <div className="absolute bg-white max-w-96 rounded-xl z-[1] p-6 flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <PiCheckCircleBold size={'1.2rem'} />
                                <h3 className="font-bold text-xl">Congrats!</h3>
                            </div>
                            <span className="text-black/60">Your account has been successfully verified!</span>
                        </div>
                    :
                    <div className="absolute bg-white max-w-96 rounded-xl z-[1] p-6 flex flex-col gap-4">
                        <h3 className="text-2xl font-bold">Verify New Email</h3>
                        <p className="text-black/70 mb-4">Insert your password to verify new email</p>
                        <Label className="font-semibold">Password</Label>
                        <div className="flex items-center relative">
                            <Input
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                type={ isHidden ? 'password' : 'text' }
                                placeholder="Submit password to verify account"
                            />
                            <div className="absolute right-2 cursor-pointer">
                                {
                                    isHidden ?
                                    <PiEyeClosed onClick={()=> setIsHidden(false)} />
                                    :
                                    <PiEye onClick={()=> setIsHidden(true)} />
                                }
                            </div>
                        </div>
                        <LoadingButton loading={isLoading}  onClick={handleSubmit} className="flex items-center gap-2 mt-8" type="submit" >Submit<PiArrowRight/></LoadingButton>
                    </div>
                :
                <SetupAccountDialog className="absolute" title={"Welcome new candidates!"} form={<SetupAdminAccountForm />} optionalText="Please fill in the data below to verify your account." />
            }
        </>
    )
};

