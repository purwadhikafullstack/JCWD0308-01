'use client'
import AddressInputs from "@/components/order/AddressInput"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Address, City, Province } from "@/constants";
import { addAddressUser, getCities, getProvinces } from "@/lib/cart";
import { getUserClientSide } from "@/lib/utils";
import React, { useEffect, useState } from "react";
import { PiHouseBold, PiXBold } from "react-icons/pi";
import { toast } from "sonner";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { LoadingButton } from "@/components/ui/loading-button";
import { patchRequest } from "@/lib/fetchRequests";

export function AddressDialog({ children, btnText, editAddress, id }: { children: React.ReactNode, btnText:string, editAddress: boolean, id?: string }) {

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [selectedProvince, setSelectedProvince] = useState<string>('');
    const [selectedCity, setSelectedCity] = useState<string>('');
    const [address, setAddress] = useState<string>('');
    const [addressList, setAddressList] = useState<Address[]>([]);
    const [ labelAddress, setLabelAddress ] = useState('');
    const [ isLoading, setIsLoading ] = useState(false);
    const [ openDialog, setOpenDialog ] = useState(false);

    const fetchProvinces = async () => {
        try {
            const data = await getProvinces();
            console.log(data);
            console.log('test');
            
            setProvinces(data.rajaongkir.results);
        } catch (err) {
            console.log(err);
        }
    };

    const removeAddress = () => {
        setSelectedProvince('');
        setSelectedCity('');
        setAddress('');
    };

    const addAddress = async () => {
        setIsLoading(true)
        const userData = await getUserClientSide()
        const data = await addAddressUser(selectedCity, address, userData.id, labelAddress.trim());
        if (data) setIsLoading(false)
        if (data.message === 'add address successfull') {
            setAddressList((prevState) => [...prevState, data.addressUser]);
            toast.success('Your address has been added to your address list')
        } else {
            toast.error('There was a problem with your request. Please try again later')
        }
        setLabelAddress('')
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
            // console.log(href)

        }

        function errorCallback(error: any) {
            console.log(error)
        }

        navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
            enableHighAccuracy: true,
            timeout: 5000
        })
    }

    async function handleEditAddress() {
        try {
            const addressData = { id, selectedCity, address, labelAddress: labelAddress.trim() }
            const res = await patchRequest(addressData, 'address/editAddress')
            if (res) setIsLoading(false)
            if (res.ok) {
                toast.success(`${labelAddress} address has been updated!`)
                setLabelAddress('')
                setSelectedProvince('');
                setSelectedCity('');
                setAddress('');
                setOpenDialog(false)
            } else {
                toast.error('There was a problem with your request. Please try again later')
            }
            
        } catch (error) {
            toast.error('There was a problem with your request. Please try again later')
        }
    }

    useEffect(() => {
        findMeGeoLocation()
        fetchProvinces();
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetchCities(selectedProvince)
        };
    }, [ selectedProvince ]);

    return (
        <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
            <AlertDialogTrigger>
                { children }
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white">
                <AlertDialogHeader className="mb-8 sm:mb-4">
                    <div className="flex items-center justify-between">
                        <AlertDialogTitle className="flex items-center gap-2"><PiHouseBold/>{ editAddress ? 'Edit Address' : 'New Address' }</AlertDialogTitle>
                        <PiXBold onClick={() => { removeAddress; setOpenDialog(false) }}  className="sm:hidden" />
                    </div>
                    <AddressInputs
                        id={id}
                        cities={cities}
                        provinces={provinces}
                        selectedCity={selectedCity}
                        selectedProvince={selectedProvince}
                        setSelectedCity={setSelectedCity}
                        setSelectedProvince={setSelectedProvince}
                        address={address}
                        setAddress={setAddress}
                        fetchCities={fetchCities}
                        labelAddress={labelAddress}
                        setLabelAddress={setLabelAddress} 
                        forWarehouse={false}
                    />
                </AlertDialogHeader>
                <AlertDialogFooter className={`${!address || !selectedCity ? 'cursor-not-allowed' : ''}`}>
                    <div className="hidden sm:block"><AlertDialogCancel onClick={removeAddress}>Cancel</AlertDialogCancel></div>
                    <LoadingButton
                        disabled={!address || !selectedCity || labelAddress.trim().length < 3}
                        loading={isLoading} onClick={editAddress ? handleEditAddress : addAddress}>{btnText}
                    </LoadingButton>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
