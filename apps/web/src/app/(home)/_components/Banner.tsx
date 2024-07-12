import React from "react"
import { Button } from "../../../components/ui/button"
import Image from "next/image"
import Link from "next/link"

export default function Banner() {
    const imgUrl = 'https://images.pexels.com/photos/3568518/pexels-photo-3568518.jpeg'
    return (
        <div className="overflow-hidden sm:rounded-xl duration-200 relative">
            <p className="absolute z-[1] top-8 text-yellow-400 font-semibold italic lg:text-3xl text-2xl h-5 flex items-center justify-center w-full">Casual Men&apos;s Wear</p>
            <div className="relative  ">
                <Image priority width={2000} height={2000} style={{objectPosition: '50% 65%'}}
                className="object-cover max-sm:h-80 h-[32rem] w-[40rem] lg:w-[50rem] xl:w-[65rem]" src={imgUrl} alt="" />

                <div className="w-full h-full bg-black/40 absolute top-0 left-0"></div>                
                <div className="z-[1] absolute bottom-10 flex flex-col items-center w-full gap-6 lg:gap-8">
                    <Button className="px-8 bg-white text-black hover:text-white font-light">
                        <Link href={'/catalogs?g=Men'}>Check Collection</Link>
                    </Button>
                </div>
            </div>
        </div>
    )
};

