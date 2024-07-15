'use client'

import CartItem from "@/components/cart/CartItem";
import SectionHeaders from "@/components/order/SectionHeaders";
import { ShippingCost } from "@/constants";
import { fetchShippingCost, checkoutOrder, checkStock, getOrderById, checkCart } from "@/lib/cart";
import { formatToIDR, getUserClientSide } from "@/lib/utils";
import { useCallback, useEffect, useState } from "react";
import DropdownAddress from "@/components/order/DropdownAddress";
import DropdownShipping from "@/components/order/DropdownShipping";
import DropdownShippingServices from "@/components/order/DropdownShippingServices";
import { useAppSelector } from "@/lib/redux/hooks";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Loading from "@/app/Loading";
import { toast } from "sonner";
import NotFound from "@/components/notFound";

type CheckoutProps = {
    params: {
        id: string
    }
}

export default function Page({ params: { id } }: CheckoutProps) {
    const cart = useAppSelector(state => state.cart.value);
    const [stockData, setStockData] = useState([])
    const [totalAmount, setTotalAmount] = useState(0);
    const [warehouseId, setWarehouseId] = useState<string | null>(null);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [shipping, setShipping] = useState<string>('');
    const [shippingService, setShippingService] = useState<ShippingCost[] | null>(null);
    const [service, setService] = useState<string>('');
    const [shippingCost, setShippingCost] = useState<number>(0);
    const [selectedShipping, setSelectedShipping] = useState<ShippingCost>()
    const [isLoading, setIsLoading] = useState(true)
    const [isStockSufficient, setIsStockSufficient] = useState(true)
    const [notFound, setNotFound] = useState(false)

    const router = useRouter()

    const validate = useCallback(async () => {
        const user = await getUserClientSide();
        if (!user) router.push('/auth');
    }, [router]);

    const getStock = useCallback(async () => {
        const stock = await checkStock(id);
        setStockData(stock);
    }, [id]);

    const getCart = useCallback(async () => {
        const cart = await checkCart(id);
        if (cart == null) {
            setNotFound(true)
        }
    }, [id]);

    const fetchShipping = useCallback(async () => {
        try {
            const result = await fetchShippingCost(warehouseId!, userAddress!, shipping);
            setShippingService(result[0].costs);
        } catch (err) {
            toast.error('cant get shipping cost')
        }
    }, [warehouseId, userAddress, shipping]);

    const calculateShippingCost = useCallback(async () => {
        const res = shippingService?.filter(item => item.service === `${service}`);
        if (res !== undefined && res.length > 0) {
            const cost = res[0].cost[0].value;
            setShippingCost(cost);
            setSelectedShipping(res[0]);
        }
    }, [service, shippingService]);

    useEffect(() => {
        try {
            validate();
            getStock();
            getCart()
            if (cart && cart.items !== undefined) {
                setTotalAmount(cart.items.reduce((acc, item) => acc + item.price, 0));
            }
        } catch (err) {
            setNotFound(true)
        }
        setIsLoading(false);
    }, [validate, getStock, cart, cart?.items, router]);

    useEffect(() => {
        if (shipping !== '') {
            fetchShipping();
        }
    }, [shipping, service, fetchShipping,])

    useEffect(() => {
        if (stockData.length > 0) {
            const outOfStockItems = stockData.filter((stock: any) => stock.totalStock < stock.orderedQuantity);
            setIsStockSufficient(outOfStockItems.length === 0);
        }
    }, [stockData])

    const handleCheckout = async () => {
        const result = await checkoutOrder(id, shippingCost, totalAmount, warehouseId!, userAddress!, shipping, selectedShipping)
        if (result.message == "Some items are out of stock") {
            toast.error(result.message);
        }
        if (result.redirect_url) {
            router.push(result.redirect_url);
        }
    }

    if (isLoading) {
        return <Loading />
    }

    if (notFound) {
        return <NotFound />
    }

    return (
        <section className="mt-8 py-8 px-7 ">
            <div className="text-center">
                <SectionHeaders mainHeader="Cart" />
            </div>
            <div className="mt-8 grid gap-8 md:grid-cols-2">
                <div>
                    <div className="flex flex-col gap-4">
                        {cart && cart.items !== undefined && cart.items.length > 0 ? cart.items.map((item, idx) => (
                            <>
                                <CartItem key={idx} item={item} stockData={stockData} />
                            </>
                        )) : (
                            <div>No products in your shopping cart</div>
                        )}
                    </div>
                    <div className="py-2 pr-16 flex justify-end items-center">
                        <div className="text-gray-500">
                            Subtotal:<br />
                            Delivery:<br />
                            Total:
                        </div>
                        <div className="font-semibold pl-2 text-right">
                            {formatToIDR(totalAmount)}<br />
                            {shippingCost === 0 ? 'Calculating cost' : formatToIDR(shippingCost)}<br />
                            {shippingCost === 0 ? 'Calculating cost' : formatToIDR(totalAmount + shippingCost)}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4 bg-gray-100 p-4 rounded-lg">
                    <h2>Checkout</h2>
                    <h2>Set Address :</h2>
                    <DropdownAddress setUserAddress={setUserAddress} setWarehouseId={setWarehouseId} />
                    <h2>Set Courier :</h2>
                    <DropdownShipping shipping={shipping} setShipping={setShipping} warehouseId={warehouseId} />
                    <DropdownShippingServices shippingServices={shippingService} service={service} setService={setService} calculateShippingCost={calculateShippingCost} fetchShipping={fetchShipping} />
                    <div className={`${!service || !isStockSufficient ? 'hover:cursor-not-allowed' : ''}`}>
                        <Button onClick={handleCheckout} disabled={!service || !isStockSufficient} className='rounded-full w-full' size={"lg"}>
                            {!service ? 'calculating cost' : 'checkout'}
                        </Button>
                    </div>
                </div>
            </div>

        </section>
    );
}
