'use client'

import { getVariantStock } from '@/app/action';
import { Input } from '@/components/ui/input';
import { IProduct, ISizeSum } from '@/constants';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { postRequest } from '@/lib/fetchRequests';
import { Separator } from '@/components/ui/separator';
import { getUserClientSide, isTokenExp } from '@/lib/utils';
import { IUser } from '@/app/(dashboard)/admins/users/page';
import { useRouter } from 'next/navigation';
import WishlistLikedBtn from '@/components/WishlistLikedBtn';
import Cookies from 'js-cookie';

interface ICarousel {
    product:IProduct
    setIndex: React.Dispatch<React.SetStateAction<number>>
    sizeSum: ISizeSum[]
}

export interface IWishlist {
    id: string,
    userId: string,
    productId: string,
    createdAt: Date
}
  

export const ProductMenu = ({product, setIndex, sizeSum}:ICarousel) => {
    const sizeOrder = ["S", "M", "L", "XL"];
    const [colorID, setColorID] = useState(product.variants[0].id)
    const [color, setColor] = useState(product.variants[0].color)
    const [size, setSize] = useState(product.oneSize ? 'ONESIZE' : 'S')
    const [stock, setStock] = useState(0)
    const [qty, setQty] = useState(0)
    const [ currentUser, setCurrentUser ] = useState<IUser | null>()
    const [ totalLikes, setTotalLikes ] = useState<number>(0)
    const [ isLiked, setIsLiked ] = useState<boolean>(false)
    const [userLogged, setUserLogged] = useState(false);
    const router = useRouter();
    
    useEffect(() => {
        const getData = async() => {
            const res = await getVariantStock(colorID, '', size.toLowerCase())
            if (res.status == 'ok') {
                if (res.data.stock !== null) {
                    setStock(res.data.stock)
                }
            }
        }
        getData()
    }, [colorID, size])    

    useEffect(() => {
        if (stock === 0 && !product.oneSize) {
            const nextAvailableSize = sizeSum
                .filter(item => item.productVariantID === colorID && item._sum.stock > 0)
                .sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size))[0];
            if (nextAvailableSize) {
                setSize(nextAvailableSize.size);
            }
        }
    }, [stock, colorID, sizeSum, product.oneSize]);

    async function getUser() {
        const user = await getUserClientSide()
        setCurrentUser(user)
    }

    async function getWishlist() {
        try {
            if (currentUser && product) {
                const res = await postRequest({ userId: currentUser?.id, productId: product.id }, 'wishlist/get-wishlist/')
                if (res.ok) {
                    setIsLiked(true)
                }
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while checking this item on your wishlist")
        }
    }

    async function handleCreateWishlist() {
        try {
            if ((currentUser && product) && userLogged) {
                const res = await postRequest({ userId: currentUser?.id, productId: product.id }, 'wishlist/')
                const data = await res.json()
                if (res.ok) {
                    toast.success(data.message)
                    router.refresh();
                    setIsLiked(!isLiked)
                    getTotalLikes()
                }
            } else {
                toast.warning(`You need to login as user to add ${ product && product?.name ? product.name : 'item' } to wishlist`)
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while saving item to your wishlist")
        }
    }

    async function getTotalLikes() {
        try {
            if (product) {
                const res = await postRequest({ productId: product.id }, 'wishlist/total-likes/')
                const data = await res.json()
                if (res.ok) {
                    setTotalLikes(data.data.length)
                    router.refresh();
                }
            } 
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while checking this item on your wishlist")
        }
    }

    useEffect(() => {
        const token = Cookies.get('token')
        const role = Cookies.get('role')
        if (token && (role == 'user' && !isTokenExp(token))) setUserLogged(true)
        getTotalLikes()
        getUser()
    }, [ ])

    useEffect(() => {
        getWishlist()
    }, [ currentUser ])

  return (
      <div>
        <p className='text-sm font-medium sm:font-semibold'>Variant: {color}</p>
         <div className='flex justify-start gap-2 mt-2 mb-5'>
            {product.variants.map((variant, index) => {
            const borderColor = Number(variant.HEX.slice(1, 2).toUpperCase()) < 4;
            return (
                <div
                key={variant.id} 
                style={{ background: `${variant.HEX}` }} 
                className={`w-7 h-7 xl:w-10 xl:h-10 hover:cursor-pointer ${
                    (color === variant.color && borderColor) ? 'border-[2px] border-gray-400' :
                    (color === variant.color) ? 'border-[2px] border-black' :
                    'border-[1px] border-black'
                }`} 
                onClick={() => {setColor(variant.color); setColorID(variant.id); setIndex(index + product.images.length + 1)}}
                >
                </div>
            );
            })}

        </div>

        <p className='text-sm font-medium sm:font-semibold'>Size: {size}</p>
         <div className='flex justify-start gap-2 mt-2 mb-5'>
            { 
                product.oneSize ?
                <div>This product only has one size.</div>
                : 
                sizeSum.filter(item => item.productVariantID == colorID).sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)).map((item, index) => {
                return (
                    <button
                    disabled={item._sum.stock == 0 ? true : false}
                    key={index} 
                    className={`w-7 h-7 xl:w-10 xl:h-10 hover:cursor-pointer md:text-xs lg:text-sm xl:text-base
                    ${item._sum.stock == 0 ? 'bg-gray-200 text-gray-400 border-gray-400' : ''} 
                    ${size == item.size ? 'border-[2px] font-semibold' : ''} 
                    border-[1px] border-black flex justify-center items-center`} 
                    onClick={() => setSize(item.size)}
                    >
                        {item.size}
                    </button>
                );
            })}
        </div>

        <div>
            <p className='font-semibold'>Quantity</p>
            <div className='flex justify-between items-center gap-4'>
                <Input
                    disabled={stock !== 0 ? false : true}
                    type='text'
                    inputMode='decimal'
                    placeholder="0"
                    value={qty ?? ''}
                    className="focus-visible:ring-black/0 focus-visible:border-black/60 text-center h-10 w-24 my-2"
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || !isNaN(Number(value))) {
                        if (isNaN(Number(value)) || Number(value) > 5) {
                        toast.warning("Maximum quantity is 5.");
                        } else {
                        setQty(Number(value));
                        }
                    }
                    }}
                />
                <AddToCartButton variantId={colorID} color={color} quantity={qty} size={size} stock={stock}/>
            </div>
            <p className={`text-xs ${stock == 0 ? 'text-red-500' : 'text-gray-500'} `}>{stock == 0 ? 'Out of stock' : `Stock: ${stock}`}</p>
            <Separator className="my-3"/>
            <div className='flex items-center gap-2'>
                <WishlistLikedBtn func={handleCreateWishlist} isLiked={isLiked}/>
                <span className={` text-black/70 ${ totalLikes > 0 ? 'hidden' : 'block' }`}>Be the first to put this item to wishlist</span>
                <span className={`text-black/70 ${ totalLikes == 0 ? 'hidden' : 'block' }`}>{ totalLikes } { totalLikes > 1 ? 'people' : 'person' } like{ totalLikes > 1 ? '' : 's' } this item</span>
            </div>
        </div>
        
    </div>
)
}
