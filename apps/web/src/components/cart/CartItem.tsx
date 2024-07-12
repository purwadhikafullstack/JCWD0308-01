'use client'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import QuantityCounter from './QuantityCounter'
import { IOrderItem } from '@/constants'
import { formatToIDR, getUserClientSide } from '@/lib/utils'
import { updateCartItemQuantity } from '@/lib/cart'
import { useAppDispatch } from '@/lib/redux/hooks'
import { setCart } from '@/lib/redux/features/cart/cartSlice'
import { DeleteOrderItemAlert } from './DeleteCartItem'

type OrderItemProps = {
    item: IOrderItem;
    stockData: { productVariantId: string; color: string; size: string; totalStock: number; orderedQuantity: number }[]
};

export default function CartItem({item, stockData}: OrderItemProps) {
    const [quantity, setQuantity] = useState(item.quantity)
    const dispatch = useAppDispatch();

    const handleSetQuantity = async (newQuantity: number) => {
        setQuantity(newQuantity);
        const userData = await getUserClientSide()
        const updatedCart = await updateCartItemQuantity(item.id, newQuantity, userData.id); 
        dispatch(setCart(updatedCart))
    }

    const stockInfo = stockData.find(stock => 
        stock.productVariantId === item.productVariantId &&
        stock.color === item.productVariant.color &&
        stock.size === item.size
    );

    const isOutOfStock = stockInfo && stockInfo.totalStock < item.quantity;
    
    return (
        <div className='relative flex flex-col md:flex-row w-full gap-4'>
            <div className='relative flex h-32 rounded-md'>
                <Image src={item.productVariant.image} alt='none'
                    className='object-cover rounded-md' width={200} height={200} />
            </div>
            <div className='w-full my-auto'>
                <h1 className="font-semibold max-w-44 truncate">{item.productVariant.product.name}</h1>
                <h1 className="max-w-44 truncate">variant: {item.productVariant.color}</h1>
                <h1 className="max-w-44 truncate">Size: {item.size}</h1>
                {isOutOfStock && (
                        <p className="text-red-500 font-semibold">Stock is insufficient!</p>
                    )}
                <QuantityCounter quantity={quantity} setQuantity={handleSetQuantity} />
                <h1>Total Price : {formatToIDR(item.price)}</h1>
                <DeleteOrderItemAlert orderItemId={item.id}/>
            </div>

        </div>
    )
}
