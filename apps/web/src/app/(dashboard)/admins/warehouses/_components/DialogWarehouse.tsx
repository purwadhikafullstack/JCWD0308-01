'use client'
import { Input } from "@/components/ui/input"
import { PiArrowUpRight, PiPlusBold, PiWarehouse } from "react-icons/pi"
import { LoadingButton } from "@/components/ui/loading-button"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import AddressInputs from "@/components/order/AddressInput"
import { City, Province } from "@/constants"
import { getCities, getProvinces } from "@/lib/cart"
import { getRequest, postRequest } from "@/lib/fetchRequests"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { IAdmin } from "../../admins/_components/columns"
import { useRouter } from "next/navigation"
import { IWarehouse } from "./columns"

export function DialogWarehouse({ btnText, editWarehouse, editDialog, setEditDialog, optionalCancleFunc, warehouseData, editFunc }
: { btnText: string, editWarehouse: boolean, editDialog?: any, setEditDialog?:any, optionalCancleFunc?: any, warehouseData?: IWarehouse, editFunc?: any }) {
    
    const [ isLoading, setIsLoading ] = useState(false);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [ openDialog, setOpenDialog ] = useState(false);
    const [ warehouseNameCheck, setWarehouseNameCheck ] = useState(true);
    const [ assignedAdmin, setAssignedAdmin ] = useState('')
    const [ existingAdmin, setExistingAdmin ] = useState<IAdmin | null>()
    const [ availableAdmins, setAvailableAdmins ] = useState([])
    const router = useRouter();
    const warehouseNameRef = useRef<HTMLInputElement>(null)
    const [ warehouseNameValue, setWarehouseNameValue ] = useState('')
    const [ defaultCity, setDefaultCity ] = useState('')

    const fetchProvinces = async () => {
        try {
            const data = await getProvinces();
            setProvinces(data.rajaongkir.results);
        } catch (err) {
            toast.error(err instanceof Error? err.message : "Error fetching provinces")
        }
    };

    const removeAddress = () => {
        setSelectedProvince('');
        setSelectedCity('');
        setAddress('');
    };

    const fetchCities = async (provinceId: string) => {
        const data = await getCities(provinceId);
        setCities(data.rajaongkir.results);
    };

    function findMeGeoLocation() {
        function successCallback(position: any) {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            let href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
        }

        function errorCallback(error: any) {
            toast.error(error instanceof Error? error.message : "Error locating your coordinate")
        }

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: true,
            timeout: 5000
        })
    }

    async function fetchAvailableAdmins(){
        try {
            const res = await getRequest('admin/availableAdmins')
            const data = await res.json()
            if (res.ok) {
                setAvailableAdmins(data.data)
            }
        } catch (error) {
            toast.error('Failed fetching available admins')
        }
    }

    async function fetchAssignedAdmin() {
        try {
            if (warehouseData?.adminID) {
                const res = await getRequest(`admin/${warehouseData?.adminID}`)
                const data = await res.json()
                if (res.ok) {
                    setExistingAdmin(data.data)
                } else {
                    toast.error(data.message)
                }
            } else return;
        } catch (error) {
            toast.error('Failed fetching available admins')
        }
    }

    useEffect(() => {
        if (warehouseData) {
            setWarehouseNameValue(warehouseData.warehouseName.trim());
            if (warehouseData.warehouseName.trim().length > 6) {
                setWarehouseNameCheck(false);
            } else {
                setWarehouseNameCheck(true);
            }
            if (warehouseData.adminID) fetchAssignedAdmin();
        }
        fetchProvinces()
        findMeGeoLocation()
        fetchAvailableAdmins()
    }, []);

    useEffect(() => {
        if (provinces && warehouseData) setSelectedProvince(warehouseData.province_id)   
    }, [ provinces ]);

    useEffect(() => {
        if (selectedProvince) fetchCities(selectedProvince);
    }, [selectedProvince]);

    useEffect(() => {
        if (cities) {
            if (warehouseData && warehouseData.city_id) {
                setDefaultCity(warehouseData?.city_name)
                setAddress(warehouseData.address)
            }
        }
    }, [ cities ]);

    async function handleCreateWarehouse() {
        setIsLoading(true)
        try {
            if (warehouseNameValue) {
                const res = await postRequest({ selectedCity, address, warehouseName: warehouseNameValue, assignedAdmin: assignedAdmin == 'null' ? '' : assignedAdmin }, 'warehouses/')
                const data = await res.json();
                if (res.ok) {
                    toast.success(data.message)
                    removeAddress()
                    setWarehouseNameValue('')
                    setOpenDialog(false)
                    router.refresh()
                } else {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            if (error instanceof Error) toast.error(error.message)
        }
        setIsLoading(false)
    }

    const handleWarehouseNameChange = () => {
        const validNamePattern = /^[a-zA-Z0-9_\s-]+$/;
        if (warehouseNameRef.current){
            const inputValue = (warehouseNameRef.current as HTMLInputElement).value.trim();
    
            if (inputValue.length > 6 && validNamePattern.test(inputValue)) {
                setWarehouseNameValue(inputValue);
                setWarehouseNameCheck(false);
            } else {
                if (!validNamePattern.test(inputValue)) {
                    toast.error('Warehouse Name cannot have any symbols except hypen ( - ) and underscore ( _ )')
                } else {
                    toast.error('Warehouse Name must be at least 7 characters')
                }
                setWarehouseNameCheck(true);
            }
        }
    }

    async function handleEditWarehouse() {
        editFunc(warehouseNameValue, selectedCity, address, assignedAdmin, existingAdmin)
    }

    function handleAdminChange(value: string) {
        if (value) {
            setAssignedAdmin(value)
        } 
    }

    return (
        <AlertDialog open={ editWarehouse? editDialog : openDialog } onOpenChange={ editWarehouse ? setEditDialog : setOpenDialog}>
            <AlertDialogTrigger asChild>
                <LoadingButton variant="outline" className={`flex gap-2 ${editWarehouse ? 'hidden' : ''}`}><PiPlusBold /><span className="hidden md:block truncate">Create New Warehouse</span></LoadingButton>
            </AlertDialogTrigger>
            <AlertDialogContent className="sm:max-w-[40rem] md:max-w-[50rem] lg:max-w-[70rem] overflow-scroll">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex gap-2 items-center"><PiWarehouse size={`1.2rem`} />{ editWarehouse ? `Edit ${ warehouseData?.warehouseName } Warehouse` : 'Create New Warehouse' }</AlertDialogTitle>
                    <AlertDialogDescription>
                        { editWarehouse ? `Change data to update ${ warehouseData?.warehouseName } Warehouse` : 'Fill in the data to create a new warehouse.' }
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex flex-col lg:flex-row-reverse justify-end gap-4">
                    <div className="w-full lg:w-[60%] flex flex-col gap-2 lg:gap-4">
                        {/* warehouse name */}
                        <div className="flex flex-col gap-1">
                            <Label>Warehouse Name</Label>
                            <Input
                                defaultValue={warehouseNameValue}
                                ref={warehouseNameRef}
                                onChange={handleWarehouseNameChange}
                                className="w-full"
                                placeholder="@example: Warehouse Jaya Abadi"
                                type="text"
                            />
                        </div>

                        {/* assign admin */}
                        <div className="flex flex-col gap-1">
                            <Label>Assign Admin</Label>
                            <Select defaultValue={ existingAdmin ? existingAdmin.id : '' } onValueChange={handleAdminChange}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select available admin" />
                                </SelectTrigger>
                                <SelectContent>
                                    { ((warehouseData && warehouseData.adminID) && existingAdmin) &&
                                        <SelectItem key={ existingAdmin.id } value={ existingAdmin.id }>{ existingAdmin.fullName }</SelectItem>
                                    }
                                    { availableAdmins.length > 0 ?
                                        availableAdmins.map((admin: IAdmin) => {
                                            return <SelectItem key={ admin.id } value={ admin.id }>{ admin.fullName }</SelectItem>
                                        })
                                        :
                                        <SelectItem value="null">Admin not available</SelectItem>
                                    }
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* warehouse address */}
                    <AddressInputs
                        cities={cities}
                        provinces={provinces}
                        selectedCity={selectedCity}
                        selectedProvince={selectedProvince}
                        setSelectedCity={setSelectedCity}
                        setSelectedProvince={setSelectedProvince}
                        address={address}
                        setAddress={setAddress}
                        fetchCities={fetchCities}
                        forWarehouse={true}
                        warehouseData={editWarehouse && warehouseData ? warehouseData : undefined}
                        defaultCity={editWarehouse && warehouseData ? defaultCity : undefined}
                        setDefaultCity={setDefaultCity}
                    />
                </div>
                <AlertDialogFooter className={`${!address || !selectedCity ? 'cursor-not-allowed' : ''}`}>
                    <AlertDialogCancel onClick={optionalCancleFunc}>
                        Cancel
                    </AlertDialogCancel>
                    <div className="flex justify-end">
                        <LoadingButton 
                            disabled={
                                !address ||
                                !selectedCity || (selectedCity == null || selectedCity == '') ||
                                warehouseNameCheck || 
                                isLoading
                            }
                            onClick={editWarehouse ? handleEditWarehouse : handleCreateWarehouse}
                            loading={isLoading} className="px-10 flex gap-2 max-sm:w-full sm:w-fit" type="submit"
                        >
                                {btnText}
                            <PiArrowUpRight />
                        </LoadingButton>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
