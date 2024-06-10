'use client'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import CartItem from "./CartItem"
import { Button } from "./ui/button"
import Link from "next/link"
import { useContext, useEffect, useState } from "react"
import { IOrder, initialOrder } from "@/constants"
import { CartContext, useCart } from '@/app/CartContext'


export default function Cart() {
    const { cart } = useCart();
    return (
        <Sheet>
            <SheetTrigger className="align-middle">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
            </SheetTrigger>
            <SheetContent className="flex flex-col gap-6 bg-white">
                <SheetHeader>
                    <SheetTitle>Cart</SheetTitle>
                    <SheetDescription>
                        Make changes to your cart item here.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 h-[70vh] overflow-y-auto">
                    {cart && cart.items.map((item, idx) => (
                        <CartItem key={item.id} item={item} />
                    ))}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <SheetTitle>Total Ammount : {cart.totalAmount}</SheetTitle>
                    <Button asChild className='rounded-full w-full' size={"lg"}>
                        <Link href={'/order'}>Checkout</Link>
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
