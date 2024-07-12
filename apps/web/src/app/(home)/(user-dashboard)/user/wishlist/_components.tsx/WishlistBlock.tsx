'use client'
import React, { useEffect, useState } from "react"
// import WishtlistItem from "./WishListItem"
import { IUser } from "@/app/(dashboard)/admins/users/page"
import { getRequest } from "@/lib/fetchRequests"
import { toast } from "sonner"
import { IWishlist } from "@/app/(home)/(products)/products/_components/menu";
import WishtlistItem from "./WishlistItem"
import { IProduct } from "@/constants"

export default function WishlistBlocks({ user }: { user: IUser | null }) {

    const [ wishlistItems, setWishlistItems ] = useState<IProduct[] | []>();

    async function getWishlistItems() {
        try {
            if (user) {
                const res = await getRequest(`wishlist/${user?.id}`)
                const data = await res.json();
                setWishlistItems(data.data)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'error fetching wishlist')
        }
    }
    
    useEffect(() => {
        getWishlistItems()
    }, [])

    return (
        <div className="flex overflow-x-scroll gap-4 lg:flex-wrap lg:justify-between">
            {
                wishlistItems && wishlistItems.length > 0 ?
                wishlistItems.map(item => {
                    return <div key={item.id}>
                        <WishtlistItem currentUser={user} item={item} />
                    </div>
                })
                :
                <span className="text-black/70">Your wishlist is empty</span>
            }
        </div>
    )
};

