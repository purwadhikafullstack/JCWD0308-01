import React, { useEffect, useState } from "react"
import { ProfileDropdown } from "@/app/(home)/_components/ProfileDropdown";
import { NavigationMenuLink, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { PiHeart, PiUser } from "react-icons/pi";
import Cart from "@/components/cart/Cart";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { IUser } from "../(user-dashboard)/user/edit-profile/_components/EditProfileForm";
import { getRequest } from "@/lib/fetchRequests";
import { toast } from "sonner";
import { IProduct } from "@/constants";

export default function AccountMenu({ userLogged, router, wishlistItems }: { userLogged: boolean, router: AppRouterInstance, wishlistItems: IProduct[] | [] | undefined }) {

    

    return (
        <div>
            {
                userLogged ? 
                    <div className="flex gap-2 items-center">
                        <NavigationMenuLink onClick={() => router.push('/user/wishlist')} className={`cursor-pointer ${navigationMenuTriggerStyle()}`}>
                            <div className="relative">
                                <PiHeart size={`20px`} />
                                {   wishlistItems &&
                                    wishlistItems?.length > 0 ?
                                    <div className="bg-red-400 w-6 h-6 rounded-full absolute -top-4 -right-4 border-2 border-white flex justify-center items-center">
                                        <span className="text-white text-xs flex justify-center items-center font-light scale-[80%]">{ wishlistItems.length < 100 ? wishlistItems.length : '99+' }</span>
                                    </div>
                                    :
                                    <></>
                                }
                            </div>
                        </NavigationMenuLink>
                        <div className="relative">
                            <Cart />
                        </div>
                        <ProfileDropdown />
                    </div>
                    :
                        <NavigationMenuLink onClick={() => router.push('/auth')} className={`${navigationMenuTriggerStyle()} cursor-pointer`}><PiUser size={`20px`} /></NavigationMenuLink>
            }
        </div>
    )
};

