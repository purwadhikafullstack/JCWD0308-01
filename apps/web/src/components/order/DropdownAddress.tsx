import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddressInputs from "./AddressInput";
import { useEffect, useState } from "react";
import { addAddressUser, fetchWarehouse, getAddressList, getCities, getProvinces } from "@/lib/cart";
import { useToast } from "../ui/use-toast";
import { Address, City, Province, Warehouse } from "@/constants";

interface DropdownAddressProps {
    setUserAddress: (value: string) => void
    setWarehouseId: (value: string) => void
}

export default function DropdownAddress({setUserAddress, setWarehouseId} : DropdownAddressProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [addressList, setAddressList] = useState<Address[]>([]);
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
    const { toast } = useToast();

    const fetchProvinces = async () => {
        try {
            const data = await getProvinces();
            setProvinces(data.rajaongkir.results);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchAddressList = async () => {
        try {
            const data: Address[] = await getAddressList();
            setAddressList(data);
            if (data.length > 0) {
                setAddress(data[0].id);
                setUserAddress(data[0].id)
            }
        } catch (err) {
            console.log(err);
        }
    };

    const addAddress = async () => {
        const data = await addAddressUser(selectedCity, address);
        if (data.message === 'add address successfull') {
            setAddressList((prevState) => [...prevState, data.addressUser]);
            toast({
                title: "Create address success",
                description: "Your address has been added to your address list",
                className: "bg-[#ffd6ba] rounded-xl"
            });
        } else {
            toast({
                variant: "destructive",
                title: "Create address failed",
                description: "There was a problem with your request. Please try again later",
            });
        }
        setSelectedProvince('');
        setSelectedCity('');
        setAddress('');
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

    const fetchWarehouseAddress = async () => {
        const warehouse = await fetchWarehouse(address)
        const warehouseId = warehouse.id
        console.log(warehouse);
        
        setWarehouse(warehouse)
        setWarehouseId(warehouseId)
    }

    useEffect(() => {
        if (selectedProvince) {
            fetchCities(selectedProvince);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (address) {
            fetchWarehouseAddress()
        }
    }, [address])

    useEffect(() => {
        fetchAddressList();
        fetchProvinces();
    }, []);

    return (
        <div>
            <Select value={address} onValueChange={setAddress}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Address" />
                </SelectTrigger>
                <SelectContent>
                    {addressList.length > 0 && addressList.map((address: Address) => (
                        <SelectItem key={address.id} value={address.id} className={`${address.mainAddress ? 'bg-orange-300' : ''}`}>
                            {address.coordinate}
                        </SelectItem>
                    ))}
                    <AlertDialog>
                        <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50 focus:text-primary-500">Add New Address</AlertDialogTrigger>
                        <AlertDialogContent className="bg-white">
                            <AlertDialogHeader>
                                <AlertDialogTitle>New Address</AlertDialogTitle>
                                <AlertDialogDescription>
                                    <AddressInputs
                                        cities={cities}
                                        provinces={provinces}
                                        selectedCity={selectedCity}
                                        selectedProvince={selectedProvince}
                                        setSelectedCity={setSelectedCity}
                                        setSelectedProvince={setSelectedProvince}
                                        address={address}
                                        setAddress={setAddress}
                                    />
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className={`${!address || !selectedCity ? 'cursor-not-allowed' : ''}`}>
                                <AlertDialogCancel onClick={removeAddress}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    disabled={!address || !selectedCity}
                                    onClick={addAddress}>Add</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </SelectContent>
            </Select>
            <h2>Warehouse :</h2>
            {address ? (
                warehouse ? (
                    <h2>{warehouse ? `${warehouse.warehouseName}` : 'No warehouse found'}</h2>
                ) : (
                    <div className="flex gap-1 items-center">
                        <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-500"></div>
                        <h2>Getting the closest warehouse from your address</h2>
                    </div>
                )
            ) : (
                <div className="flex gap-1 items-center">
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-blue-500"></div>
                    <h2>Waiting for your address</h2>
                </div>
            )}
        </div>
    );
}