import { IProductVariant } from '@/constants';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

interface IProductCard {
    slug:string
    totalStock: number
    thumbnailURL: string
    gender:string
    oneSize:boolean
    variants: IProductVariant[]
    name:string
    price:number
}

export const ProductCard = ({slug, totalStock, thumbnailURL, gender, oneSize, variants, name, price}:IProductCard) => {
  return (
    <Link 
    className='w-40 h-[280px] sm:w-60 sm:h-[25rem] hover:cursor-pointer items flex flex-col bg-white rounded-md drop-shadow-[0_5px_5px_rgba(0,0,0,0.05)] select-none' 
    href={`/products/${slug}`} 
    >
        <Image 
        alt={slug} 
        width={240}
        height={240}
        className={`object-cover object-center w-40 h-40 sm:w-[240px] sm:h-[240px] rounded-t-md ${totalStock == 0 ? 'saturate-0' : ''}`}
        src={thumbnailURL} 
        />
        <div className='flex flex-col grow p-3 pt-0 pb-3 sm:pb-4'>
        <div className='flex justify-between my-2 text-[0.5rem] sm:text-xs'>
            <p className='font-semibold text-slate-500'>{gender}</p>
            <p className='font-semibold text-slate-500'>{oneSize ? 'One size' : 'S - XL'}</p>
        </div>

        <div className='flex justify-start gap-1'>
            {variants.map(variant => {
            const borderColor = variant.HEX.slice(3, 4).toUpperCase() === 'F';
            return (
                <div 
                key={variant.id} 
                style={{ background: `${variant.HEX}` }} 
                className={`w-3 h-3 sm:w-5 sm:h-5 ${borderColor ? "border-[1px] border-slate-400" : ''}`} 
                ></div>
            );
            })}
        </div>
        
        <div className='flex flex-col justify-between grow mt-2'>
            <p className='text-sm sm:text-xl font-semibold'>{name}</p>
            <p className='text-xs sm:text-base'>Rp{new Intl.NumberFormat('en-DE').format(price)}</p>
        </div>
        </div>
    </Link>
  )
}
