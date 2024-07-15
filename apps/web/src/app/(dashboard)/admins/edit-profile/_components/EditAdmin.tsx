'use client'
import Link from "next/link";
import React, { useEffect, useState } from "react"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { InputPhotoProfile } from "@/app/(home)/(user-dashboard)/user/edit-profile/_components/InputPhotoProfile";
import { ToolTip } from "@/components/Tooltip";
import { LoadingButton } from "@/components/ui/loading-button";
import { PiUserCircleThin, PiXBold, PiCheckBold, PiWarningCircle } from "react-icons/pi";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { deleteRequest, getRequest, patchRequest } from "@/lib/fetchRequests";
import useStorage from "@/hooks/useStorage";
import { toast } from "sonner";
import { IAdmin } from "../../admins/_components/columns";
import { getAdminClientSide } from "@/lib/utils";
import { usePathname } from "next/navigation";
import ActiveIndicator from "@/components/sidebar/ActiveIndicator";
import { Warehouse } from "@/constants";

export default function AdminMenu({ admin }: { admin: IAdmin | null }) {

    const adminLinks = [
        {
            url: '/admins/edit-profile',
            text: 'Edit Profile',
        },
        {
            url: '/admins/change-password',
            text: 'Change Password',
        },
    ]
    const pathname = usePathname();
    const [file, setFile] = useState<File | null>(null);
    const [ currentAdmin, setCurrentAdmin ] = useState(admin)
    const [ isLoading, setIsloading ] = useState(false)
    const [ assignedWarehouse, setAssignedWarehouse ] = useState<Warehouse| null>()
    const [ open, setOpen ] = useState(false)
    const { uploadFile } = useStorage()
    const [ currentPhotoProfile, setCurrentPhotoProfile ] = useState<string | null | undefined>(admin?.imgUrl);

    function showDeleteBtn() {
        const trashIcon = document.getElementById('dashboard-trash-icon') as HTMLElement;
        trashIcon?.classList.add('right-10')
        trashIcon?.classList.add('opacity-100')
        trashIcon?.classList.remove('right-12')
        trashIcon?.classList.remove('opacity-0')
    }

    function hideDeleteBtn() {
        const trashIcon = document.getElementById('dashboard-trash-icon') as HTMLElement;
        trashIcon?.classList.remove('right-2')
        trashIcon?.classList.remove('opacity-100')
        trashIcon?.classList.add('right-12')
        trashIcon?.classList.add('opacity-0')
    }

    async function handleChangePhoto() {
        if (admin) {
            setIsloading(true)
            try {
                let imgUrl: string = ''
                if (file) imgUrl = await uploadFile(file, 'profile')
                const res = await patchRequest({ imgUrl: imgUrl }, `admin/${admin.id}`)
                const data = await res.json()
                if (res) setIsloading(false)
                if (res.ok) {
                    setFile(null)
                    toast.success('Photo profile has been updated')
                    const resUser = await (await getRequest(`admin/${admin.id}`)).json()
                    const currentUser = resUser.data
                    setCurrentPhotoProfile(currentUser.imgUrl)
                } else if (res.status == 404) {
                    toast.error('User not found!')
                } else toast.error(data.message)
            } catch (error) {
                toast.error('Server error')
            }
        }
    }

    async function handleRemovePhotoProfile(){
        if (admin) {
            setIsloading(true)
            const res = await (await deleteRequest(`admin/photo/${admin.id}`)).json()
            try {
                if (res) setIsloading(false)
                if (res.status == 'ok') {
                    toast.success(res.message)
                    const response = await (await getRequest(`admin/${admin.id}`)).json()
                    const currentUser = response.data
                    setCurrentPhotoProfile(currentUser.imgUrl)
                    setOpen(false)
                } else {
                    toast.error(res.message)
                }
            } catch (error) {
                setIsloading(false)
                toast.error(res.message)
            }
        }
    }

    async function refreshAdmin() {
        const admin = await getAdminClientSide(); setCurrentAdmin(admin)
    }

    async function getWarehouseByAdmin() {
        try {
            if (admin?.role == 'warAdm') {
                const res = await getRequest(`warehouses/assigned-warehouse/${admin?.id}`);
                const data = await res.json();
                if (res.ok) {
                    setAssignedWarehouse(data.data);
                } else {
                    setAssignedWarehouse(null);
                }
            }
        } catch (error) {
            toast.error(error instanceof Error? error.message : `Something went wrong while fetching assigned warehouse by admin id`)
        } 
    }

    useEffect(() => {
        getWarehouseByAdmin()
        refreshAdmin()
    }, [ currentPhotoProfile ])

    return (
        <div className="md:w-72 w-full lg:border-2 md:border-r-2 sm:pr-10 lg:p-4 flex flex-col md:justify-start lg:justify-center gap-20">
            <div className='flex items-center flex-col gap-2 relative w-full'>
                <h2 className="font-semibold">{ admin?.role == 'warAdm' ? 'Warehouse Admin' : 'Super Admin' }</h2>
                <span className={`text-black/60 ${ assignedWarehouse ? 'block' : 'hidden' }`}>of { assignedWarehouse ? assignedWarehouse.warehouseName : '' }Warehouse</span>
                <div onMouseEnter={showDeleteBtn} onMouseLeave={hideDeleteBtn} className='group w-40 h-40 rounded-full flex justify-center items-center relative overflow-hidden'>
                    {
                        admin && currentAdmin?.imgUrl ? 
                            file ? 
                            <div className="">
                                <Image priority className='object-cover object-top rounded-full h-[160px] w-[160px]' width={400} height={400} src={URL.createObjectURL(file)} alt={''} />
                            </div>
                            :
                            <div className="">
                                <Image priority className='object-cover object-top rounded-full h-[160px] w-[160px]' width={400} height={400} src={currentAdmin.imgUrl} alt={''} />
                            </div>
                        :
                        file ?
                        <div className="">
                            <Image priority className='object-cover object-top rounded-full h-[160px] w-[160px]' width={400} height={400} src={URL.createObjectURL(file)} alt={''} />
                        </div>
                        :
                        <PiUserCircleThin className='w-full h-full bg-[#dadde2] fill-white' />
                    }
                    <ToolTip className='w-full h-full absolute hover:bg-black/50 hover:opacity-100 opacity-0 duration-100' content={<span className="text-black/70">
                        <span className="font-semibold text-black">Preferable: &nbsp;</span>
                            Square orientation, 1MB max file size.
                        </span>} >
                        <InputPhotoProfile setFile={setFile}/>
                    </ToolTip>
                </div>

                {
                    file &&
                    <div className="absolute -top-12 flex gap-5">
                        <Button onClick={() => setFile(null)} className="rounded-lg flex items-center gap-1 py-1 px-3 bg-slate-50 text-slate-800 border-2 border-slate-800 hover:bg-white"><PiXBold />cancel</Button>
                        <LoadingButton loading={ isLoading ? true : false } onClick={handleChangePhoto} className="rounded-lg flex items-center gap-1 py-1 px-3"><PiCheckBold />confirm</LoadingButton>
                    </div>
                }
                
                <div className="absolute -right-0 -bottom-0 w-auto cursor-pointer">
                    { admin && !admin?.accountActive && <ToolTip className='' content={<span>Your account hasn&apos;t been verified!</span>} ><PiWarningCircle className='fill-yellow-400 z-10 absolute bottom-14 right-8' size={'1.2rem'} /> </ToolTip> }
                </div>
                <div onMouseEnter={showDeleteBtn} onMouseLeave={hideDeleteBtn} id="dashboard-trash-icon" className="absolute right-12 bottom-[12rem] w-auto cursor-pointer duration-200 opacity-0">
                        <AlertDialog open={open}>
                            <AlertDialogTrigger asChild onClick={() => {setOpen(true); hideDeleteBtn() }}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="w-[1rem] fill-black/60" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                    <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                                </svg>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete photo profile?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    The action cannot be undone. This will permanently delete your
                                    photo profile from the database.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
                                    <LoadingButton loading={ isLoading ? true : false } onClick={handleRemovePhotoProfile} className="bg-red-500">
                                        Delete Photo Profile
                                    </LoadingButton>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                </div>
                <div className='text-center'>
                    <h2 className='text-lg font-semibold'>{ admin?.fullName }</h2>
                    <p className='text-black/60'>{ admin?.email }</p>
                </div>
            </div>
            <div className='flex flex-col gap-2'>
                {
                    adminLinks.map((link, idx) => {
                        const isActive = pathname.startsWith(link.url)
                        return <Link className={` ${ isActive ? 'bg-black text-white' : 'text-black/60 hover:text-black' } pl-1 py-[2px] rounded-sm cursor-pointer duration-200`} href={link.url} key={idx}>{link.text}</Link>
                    })
                }
            </div>
        </div>
    )
};

