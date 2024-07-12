'use client'

import { getVariantStock } from '@/app/action';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IProduct, ISizeSum } from '@/constants';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import { PiShoppingCart } from "react-icons/pi";
import AddToCartButton from '@/components/cart/AddToCartButton';

interface ICarousel {
    product:IProduct
    setIndex: React.Dispatch<React.SetStateAction<number>>
    sizeSum: ISizeSum[]
  }

  
  

export const ProductMenu = ({product, setIndex, sizeSum}:ICarousel) => {
    const sizeOrder = ["S", "M", "L", "XL"];
    const [colorID, setColorID] = useState(product.variants[0].id)
    const [color, setColor] = useState(product.variants[0].color)
    const [size, setSize] = useState(product.oneSize ? 'ONESIZE' : 'S')
    const [stock, setStock] = useState(0)
    const [qty, setQty] = useState(0)

    
    
    
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
                {/* <Button className=' w-full gap-2' disabled={stock == 0 ? true : false}>
                    ADD TO CART
                    <PiShoppingCart className='text-xl'/>
                </Button> */}
            </div>
            <p className='text-xs text-gray-500'>Stock: {stock}</p>
        </div>
        
    </div>
)
}
