'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartItem from "./CartItem";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useEffect, useState } from "react";
import { getCartItems } from "@/lib/cart";
import { setCart } from "@/lib/redux/features/cart/cartSlice";
import { formatToIDR } from "@/lib/utils";

export default function Cart() {
    const cart = useAppSelector(state => state.cart.value);
    const [totalAmount, setTotalAmount] = useState(0);
    const [quantity, setQuantity] = useState(0);

    const dispatch = useAppDispatch();

    const getCartDetail = async () => {
        try {
            const res = await getCartItems();
            if (res.message === 'no cart') {
                dispatch(setCart(null));
            } else {
                dispatch(setCart(res));
            }
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getCartDetail();
    }, []);

    useEffect(() => {
        if (cart) {
            setTotalAmount(cart.items.reduce((acc, item) => acc + item.quantity * item.price, 0));
            setQuantity(cart.items.reduce((acc, item) => acc + item.quantity, 0));
        } else {
            setQuantity(0)
            setTotalAmount(0)
        }
    }, [cart]);

    return (
        <Sheet>
            <SheetTrigger className="align-middle relative flex">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {quantity > 0 && (
                    <p className="flex absolute bg-red-500 rounded-full w-4 h-4 text-xs text-center -right-1 justify-center text-gray-900">
                        {quantity}
                    </p>
                )}
            </SheetTrigger>

            <SheetContent className="flex flex-col gap-6 bg-white">
                <SheetHeader>
                    <SheetTitle>Cart</SheetTitle>
                    <SheetDescription>
                        Make changes to your cart items here.
                    </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-2 h-[70vh] overflow-y-auto">
                    {cart && cart?.items.length > 0 ? cart.items.map((item, idx) => (
                        <CartItem key={idx} item={item} />
                    )) : (
                        <p>No items in the cart.</p>
                    )}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <SheetTitle>Total Amount: {formatToIDR(totalAmount)}</SheetTitle>
                    <Button asChild className='rounded-full w-full' size={"lg"}>
                        {cart ? (
                            <Link href={'/order'}>Checkout</Link>
                        ) : (
                            <Link href={'/'}>Your Cart is empty go find some item</Link>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}