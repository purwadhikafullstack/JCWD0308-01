'use client'
import React from "react"
import { PiHeart, PiHeartFill } from "react-icons/pi"

export default function WishlistLikedBtn({ func, isLiked }: { func: any, isLiked: boolean }) {
    return (
        <div className='cursor-pointer' onClick={func}>
            {
                isLiked ?
                    <PiHeartFill className='fill-red-400' size={`1.5rem`} />
                :
                    <PiHeart className='fill-black/80' size={`1.5rem`} />
            }
        </div>
    )
};

