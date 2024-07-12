import React, { useEffect } from "react"
import { type CarouselApi } from "@/components/ui/carousel"
import { Card, CardContent } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { IProduct } from "@/constants"
import Image from "next/image"

interface IRowCarousel {
    product:IProduct
    setIndex: React.Dispatch<React.SetStateAction<number>>
    index: number
}



export function RowCarousel({product, index, setIndex}:IRowCarousel) {
    

    const [api, setApi] = React.useState<CarouselApi>()
    useEffect(() => {
        if (api) {
           api.scrollTo(index)
        }
        },[index, api])


  return (
    <Carousel className="my-5 group" setApi={setApi}>
      <CarouselContent className="">
            <CarouselItem 
            key={product.id} 
            className="basis-1/6"
            onClick={() => setIndex(0)}>
                <Image
                alt={product.id}
                src={product.thumbnailURL}
                width={500} height={500}
                className={`object-cover w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px]  object-center ${index == 0 ? 'border-[1px] border-black' : ''}`}/>
            </CarouselItem>

        {product.images.map((item, idx) => (
            <CarouselItem 
            key={item.id}
            className="basis-1/6"
            onClick={() => setIndex(idx + 1)}>
                <Image 
                alt={item.id} 
                src={item.image} 
                width={500} height={500} 
                className={`object-cover object-center w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] ${index == idx + 1 ? 'border-[1px] border-black' : ''}`}/>
            </CarouselItem>
        ))}

        {product.variants.map((item, idx) => (
             <CarouselItem 
             key={idx} 
             className="basis-1/6"
             onClick={() => setIndex(idx + product.images.length + 1)}>
                <Image
                alt={item.id}
                src={item.image}
                width={500} height={500}
                className={`object-cover object-center w-[40px] h-[40px] sm:w-[50px] sm:h-[50px] lg:w-[60px] lg:h-[60px] xl:w-[70px] xl:h-[70px] ${index == idx + product.images.length + 1 ? 'border-[1px] border-black' : ''}`}/>
            </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 w-5 h-full rounded-sm group-hover:flex hidden"  />
      <CarouselNext className="absolute right-0 w-5 h-full rounded-sm group-hover:flex hidden"/>
    </Carousel>
  )
}
