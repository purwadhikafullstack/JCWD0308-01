import React from "react"
import MarqueeBackground from "./(account)/_components/MarqueeBackground"
import BrickPhotoBackground from "./(account)/_components/BrickPhotoBackground"
import { randomizer } from "./(account)/(account-setup)/layout"
import { PiArrowLeft, PiArrowRight, PiWarning } from "react-icons/pi"
import Link from "next/link"

export default function Page() {

    return (
        <div>
            <div className='h-screen flex justify-center items-center relative overflow-hidden'>
                { randomizer ? <BrickPhotoBackground /> : <MarqueeBackground/> }
                <div className="w-96 p-8 z-10 bg-white/90 absolute rounded-lg">
                    <div className="mb-8">
                        <div className="flex items-center gap-2">
                            <PiWarning size={`1.4rem`}  />
                            <h3 className="font-bold text-2xl text-center">Erorr 404</h3>
                        </div>
                        <span className="text-black/80">Page you&apos;re looking is not found.</span>
                    </div>
                    <div className="flex justify-end">
                        <Link href={'/'} className="flex items-center gap-2 text-black/60 hover:text-black duration-200 cursor-pointer">
                            <span>Home Page</span>
                            <PiArrowRight size={`1.4rem`} />
                        </Link>

                    </div>
                </div>
            </div>
        </div>
    )
};

