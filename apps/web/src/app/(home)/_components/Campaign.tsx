import React from "react"
import { Button } from "../../../components/ui/button"
import Image from "next/image"
import Link from "next/link"


export default function Campaign() {

    const imgUrl = 'https://images.pexels.com/photos/802221/pexels-photo-802221.jpeg'

    return (
        <div className="relative">
            <div className="flex relative">
                <Image priority width={1000} height={100}
                className="sm:max-h-[25rem] w-full object-cover" style={{objectPosition: '50% 70%'}} src={imgUrl} alt="" />
            </div>
            <div className="
                flex justify-center flex-col items-center absolute top-0 w-full h-full
                gap-8 text-white z-[1]
            ">
                <div className="text-center flex flex-col items-center gap-2">
                    <p className="font-extralight lg:text-3xl text-2xl h-5 flex items-center"> We&apos;re Committed to a Healthier Environment</p>
                    <p className="font-light text-white/75 hidden sm:block">Read about our progress in our latest impact report.</p>
                </div>
                <Link href={'/green-project'}>
                    <Button className="px-8 bg-white text-black hover:text-white font-light">Learn more</Button>
                </Link>
            </div>
            <div className="w-full h-full bg-black/40 absolute top-0 left-0"></div>
        </div>
    )
};

