import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import AddressInputs from "./AddressInput";
import { useCallback, useEffect, useState } from "react";
import { addAddressUser, fetchWarehouse, getAddressList, getCities, getProvinces } from "@/lib/cart";
import { toast } from "sonner"
import { Address, City, Province, Warehouse } from "@/constants";
import { getUserClientSide } from "@/lib/utils";

interface DropdownAddressProps {
    setUserAddress: (value: string) => void
    setWarehouseId: (value: string) => void
}

export default function DropdownAddress({ setUserAddress, setWarehouseId }: DropdownAddressProps) {
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [addressList, setAddressList] = useState<Address[]>([]);
    const [warehouse, setWarehouse] = useState<Warehouse | null>(null)
    const [labelAddress, setLabelAddress] = useState('');
    console.log(addressList);

    const fetchProvinces = async () => {
        try {
            const data = await getProvinces();
            setProvinces(data.rajaongkir.results);
        } catch (err) {
            console.log(err);
        }
    };

    const fetchAddressList = useCallback(async () => {
        try {
            const userData = await getUserClientSide();
            const data: Address[] = await getAddressList(userData.id);
            setAddressList(data);
            if (data.length > 0) {
                setAddress(data[0].id);
                setUserAddress(data[0].id);
            }
        } catch (err) {
            console.log(err);
        }
    }, [setUserAddress]);

    const addAddress = async () => {
        const userData = await getUserClientSide()
        const data = await addAddressUser(selectedCity, address, userData.id, labelAddress);
        if (data.message === 'add address successfull') {
            setAddressList((prevState) => [...prevState, data.addressUser]);
            toast.success('Your address has been added to your address list')
        } else {
            toast.success('There was a problem with your request. Please try again later')
        }
        setSelectedProvince('');
        setSelectedCity('');
        setAddress('');
        setTimeout(() => {
            window.location.reload()
        }, 200)
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

    const fetchWarehouseAddress = useCallback(async () => {
        const warehouse = await fetchWarehouse(address);
        const warehouseId = warehouse.id;

        setWarehouse(warehouse);
        setWarehouseId(warehouseId);
    }, [address, setWarehouseId]);

    useEffect(() => {
        if (selectedProvince) {
            fetchCities(selectedProvince);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (address) {
            fetchWarehouseAddress()
        }
    }, [address, fetchWarehouseAddress])

    useEffect(() => {
        fetchAddressList();
        fetchProvinces();
    }, [fetchAddressList]);

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
                                        fetchCities={fetchCities} labelAddress={labelAddress} setLabelAddress={setLabelAddress} forWarehouse={false} />
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
                    <h2>{warehouse.warehouseName ? `${warehouse.warehouseName}` : 'Invalid address please change your address'}</h2>
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
