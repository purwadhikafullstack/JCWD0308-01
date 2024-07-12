'use client';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartItem from "./CartItem";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { useCallback, useEffect, useState } from "react";
import { checkStock, getCartItems } from "@/lib/cart";
import { setCart } from "@/lib/redux/features/cart/cartSlice";
import { formatToIDR, getUserClientSide } from "@/lib/utils";
import { PiShoppingCartSimple } from "react-icons/pi";

export default function Cart() {
    const cart = useAppSelector(state => state.cart.value);
    const [totalAmount, setTotalAmount] = useState(0);
    const [quantity, setQuantity] = useState(0);
    const [stockData, setStockData] = useState([])
    const dispatch = useAppDispatch();

    const getStock = useCallback(async () => {
        const stock = await checkStock(cart?.id!)
        setStockData(stock)
    }, [cart?.id])

    const getCartDetail = useCallback(async () => {
        try {
            const userData = await getUserClientSide()
            const res = await getCartItems(userData.id);
            if (res.message === 'no cart') {
                dispatch(setCart(null));
            } else {
                dispatch(setCart(res));
            }
        } catch (err) {
            console.log(err);
        }
    }, [dispatch])

    useEffect(() => {
        getCartDetail();
    }, [getCartDetail])

    useEffect(() => {
        if (cart?.items) {
            getStock()
            setTotalAmount(cart.items.reduce((acc, item) => acc + item.price, 0));
            setQuantity(cart.items.reduce((acc, item) => acc + item.quantity, 0));
        } else {
            setQuantity(0)
            setTotalAmount(0)
        }
    }, [cart, getStock])

    return (
        <Sheet>
            <SheetTrigger className="align-middle relative flex">
                <PiShoppingCartSimple className="" size={`20px`} />
                {quantity > 0 && (
                    <div className="bg-red-400 w-5 h-5 md:w-6 md:h-6 rounded-full absolute -top-3 md:-top-4 -right-3 md:-right-4 border-2 border-white flex justify-center items-center">
                        <span className="text-white  text-[.7rem] md:text-sm flex justify-center items-center font-light md:scale-[82%] ">{quantity}</span>
                    </div>
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
                    {cart?.items && cart?.items.length > 0 ? cart.items.map((item, idx) => (
                        <CartItem key={idx} item={item} stockData={stockData}/>
                    )) : (
                        <p>No items in the cart.</p>
                    )}
                </div>
                <div className="w-full flex flex-col gap-2">
                    <SheetTitle>Total Amount: {formatToIDR(totalAmount)}</SheetTitle>
                    <Button asChild className='rounded-full w-full' size={"lg"}>
                        {cart ? (
                            <Link href={`/checkout/${cart.id}`}>Checkout</Link>
                        ) : (
                            <Link href={'/'}>Your Cart is empty go find some item</Link>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
