import { formatToIDR } from "@/lib/utils"
import React, { useEffect, useState } from "react"
import { PiHeart } from "react-icons/pi"
import Image from "next/image"
import { IProduct } from "@/constants"
import { useRouter } from "next/navigation"
import WishlistLikedBtn from "@/components/WishlistLikedBtn"
import { toast } from "sonner"
import { IUser } from "../../edit-profile/_components/EditProfileForm"
import { postRequest } from "@/lib/fetchRequests"

export default function WishtlistItem({ item, currentUser }: { item: IProduct | null, currentUser: IUser | null }) {

    const [ isLiked, setIsLiked ] = useState<boolean>(false)
    const router = useRouter()

    async function handleCreateWishlist() {
        try {
            if (currentUser && item) {
                const res = await postRequest({ userId: currentUser?.id, productId: item.id }, 'wishlist/')
                const data = await res.json()
                if (res.ok) {
                    toast.success(data.message)
                    router.refresh();
                    setIsLiked(!isLiked)
                }
            } else {
                toast.warning(`You need to login to add ${ item && item?.name ? item.name : 'item' } to wishlist`)
            }
    
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while saving item to your wishlist")
        }
    }

    async function getWishlist() {
        try {
            if (currentUser && item) {
                const res = await postRequest({ userId: currentUser?.id, productId: item.id }, 'wishlist/get-wishlist/')
                if (res.ok) {
                    setIsLiked(true)
                }
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while checking this item on your wishlist")
        }
    }

    useEffect(() => {
        getWishlist()
    }, [ currentUser ])

    return (
        <>
            {
                item ?
                <div>
                    <div onClick={() => router.push(`/products/${item.slug}`)} className="cursor-pointer relative">
                        <Image
                            priority
                            width={350} height={100}
                            className="rounded-lg object-cover max-md:max-w-[250px] max-md:max-h-[250px] max-w-[280px] max-h-[280px]" src={item.thumbnailURL} alt="" 
                        />
                    </div>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="font-semibold">{ item.name }</p>
                            <p className="font-light">{ formatToIDR(item.price) }</p>
                        </div>

                        <WishlistLikedBtn func={handleCreateWishlist} isLiked={isLiked} />
                    </div>
                </div>
                :
                <></>
            }
        </>
    )
};

