'use client'
import React, { useEffect, useState } from "react"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
  } from "@/components/ui/carousel/carousel"
import Autoplay from "embla-carousel-autoplay"
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PiArrowRight } from "react-icons/pi";


export default function HeroCarousel() {
    const videos = [
        {
            sd: 'https://videos.pexels.com/video-files/4125025/4125025-sd_640_360_24fps.mp4',
            hd: 'https://videos.pexels.com/video-files/4125025/4125025-hd_1280_720_24fps.mp4',
            uhd: 'https://videos.pexels.com/video-files/4125025/4125025-uhd_2560_1440_24fps.mp4',
        },
        {
            sd: 'https://videos.pexels.com/video-files/4919748/4919748-sd_640_338_25fps.mp4',
            hd: 'https://videos.pexels.com/video-files/4919748/4919748-hd_1366_720_25fps.mp4',
            uhd: 'https://videos.pexels.com/video-files/4919748/4919748-uhd_2732_1440_25fps.mp4',
        },
        {
            sd: 'https://videos.pexels.com/video-files/4613100/4613100-sd_640_338_25fps.mp4',
            hd: 'https://videos.pexels.com/video-files/4613100/4613100-hd_1366_720_25fps.mp4',
            uhd: 'https://videos.pexels.com/video-files/4613100/4613100-uhd_2732_1440_25fps.mp4',
        },
    ]
    const [index, setIndex] = useState(0);

    const dummyDataCarousel = [
        { img: '' }, { img: '' },
        {
            img: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/466782/sub/goods_466782_sub23.jpg?width=750',
        },
        {
            img: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=2970&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        },
    ];

    const gridImages = [
        'https://image.uniqlo.com/UQ/ST3/id/imagesgoods/470298/item/idgoods_35_470298.jpg?width=750',
        'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/466575002/sub/goods_466575002_sub11.jpg?width=750',
        'https://image.uniqlo.com/UQ/ST3/id/imagesgoods/461085/item/idgoods_11_461085.jpg?width=750',
        'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/464024/sub/goods_464024_sub11.jpg?width=750',
    ]

    useEffect(() => {
        let vid = document.getElementById("video-carousel");
        
        if (vid) {
            const handleVideoEnded = () => {
                setIndex((prevIndex) => (prevIndex === videos.length - 1 ? 0 : prevIndex + 1));
            };
            vid.addEventListener('ended', handleVideoEnded);
            return () => {
                vid.removeEventListener('ended', handleVideoEnded);
            };
        }
    }, [videos]);

    useEffect(() => {
        let vid = document.getElementById("video-carousel") as HTMLVideoElement;
        if (vid) {
            vid.load();
            vid.play();
        }
    }, [index]);

    const plugin = React.useRef(
        Autoplay({ delay: 2000, stopOnInteraction: true })
    )

    return (
        
        <div className="
            flex justify-center items-center flex-col
            max-w-[40rem] lg:max-w-[50rem] xl:max-w-[65rem]
            duration-200 sm:rounded-xl overflow-hidden gap-4
        ">
            <Carousel 
                plugins={[plugin.current]} className="cursor-grab"
                onMouseEnter={plugin.current.stop} onMouseLeave={plugin.current.isPlaying}
            >
                <CarouselContent >
                    {
                        dummyDataCarousel.map((item, idx) => {
                            return <CarouselItem key={idx} className="basis-3/4">
                                { idx == 1 ?  
                                <div className="sm:rounded-xl flex items-center justify-center overflow-hidden duration-200 lg:max-h-[38rem] relative h-full">
                                    <div className="z-[1] flex flex-col gap-4 lg:gap-8">
                                        <h3 className=" text-center text-white lg:text-3xl text-lg">Now Up to 40% Off!</h3>
                                        <div className="gap-4 justify-center hidden lg:flex">
                                            <Link href={'/catalogs?g=Men'}>
                                                <Button className="bg-white/50 font-light text-black hover:bg-white px-4 lg:px-8">Shop for Women</Button>
                                            </Link>
                                            <Link href={'/catalogs?g=Women'}>
                                                <Button className="bg-white/50 font-light text-black hover:bg-white px-4 lg:px-8">Shop for Men</Button>
                                            </Link>
                                        </div>
                                        <Link href={'/catalogs'} className="text-center lg:hidden">
                                            <Button className="bg-white/50 font-light text-black hover:bg-white px-8">Shop Now</Button>
                                        </Link>
                                    </div>
                                    <video id="video-carousel" autoPlay muted className="absolute object-cover h-full w-full" width="320" height="240" preload="none">
                                        <source src={videos[index].sd} type="video/mp4" />
                                        <source src={videos[index].hd} type="video/mp4" />
                                        <source src={videos[index].uhd} type="video/mp4" />
                                    </video>
                                </div>
                                :
                                idx == 0 ?
                                    <div className="sm:rounded-xl overflow-hidden duration-200 h-full relative">

                                        <div className="grid grid-cols-2 grid-rows-2 h-full w-full">
                                        {gridImages.map((imgUrl, index) => {
                                            return (
                                                <div key={index} className="relative w-full h-full pb-[60%] overflow-hidden">
                                                    <Image 
                                                        className="absolute top-0 left-0 w-full h-full object-cover" 
                                                        priority 
                                                        width={500} 
                                                        height={300} 
                                                        src={imgUrl} 
                                                        alt={`Image ${index + 1}`} 
                                                    />
                                                </div>
                                            );
                                        })}
                                        </div>

                                        <div className="flex justify-center items-center text-white absolute top-0 bottom-0 left-0 right-0 font-thin lg:text-2xl text-md sm:text-xl z-[1]">
                                            <div className="bg-white lg:py-4 lg:px-10">
                                                <span className="text-black">Everyday. 
                                                    <span className="font-semibold text-red-600">Wear. Confident.</span></span>
                                            </div>
                                        </div>
                                    </div>
                                :
                                    <div className="sm:rounded-xl overflow-hidden duration-200 h-full relative lg:max-h-[38rem] ">
                                        {
                                            idx == 2 ?
                                            <>
                                                <Image className="object-cover h-full" priority width={800} height={608} src={item.img} alt="" />
                                                <div className="flex justify-center h-fit text-white absolute bottom-20 left-0 right-0 font-thin lg:text-2xl text-md sm:text-xl z-[1]">
                                                    <div className="bg-white lg:py-4 lg:px-10 text-center">
                                                        <span className="text-black">Made with &nbsp;
                                                        <span className="font-semibold text-green-600">Environmentally-safe fabrics</span></span>
                                                    </div>
                                                </div>
                                            </>
                                            :
                                            <>
                                                <div className=" h-full flex">
                                                    <Image className="w-[33%] object-cover h-full" priority width={800} height={608} src={'https://images.pexels.com/photos/321497/pexels-photo-321497.jpeg'} alt="" />
                                                    <Image className="w-[33%] object-cover h-full" priority width={800} height={608} src={'https://images.pexels.com/photos/3133688/pexels-photo-3133688.jpeg'} alt="" />
                                                    <Image className="w-[34%] object-cover h-full" priority width={800} height={608} src={'https://images.pexels.com/photos/914668/pexels-photo-914668.jpeg'} alt="" />
                                                </div>
                                                <div className="flex justify-center h-fit text-white absolute lg:bottom-40 bottom-20 left-0 right-0 font-thin lg:text-2xl text-md sm:text-xl z-[1]">
                                                    <div className="bg-white lg:py-4 lg:px-10 w-full text-center">
                                                        <span className="text-black">Comfy&nbsp;
                                                        <span className="font-semibold text-red-600">For Everyone</span></span>
                                                    </div>
                                                </div>
                                                <Link href={'/catalogs'} className="duration-200 absolute bottom-4 right-4 hover:bg-white hover:text-black bg-black/50 lg:bg-black/40 lg:px-4 lg:py-2 py-1 px-2 rounded-sm text-white flex items-center gap-2">
                                                    <span className=" max-lg:hidden">Shop Now</span>
                                                    <PiArrowRight />
                                                </Link>
                                            </>

                                        }
                                    </div>
                                }
                            </CarouselItem>
                        })
                    }
                </CarouselContent>
            </Carousel>
        </div>
    )
};

