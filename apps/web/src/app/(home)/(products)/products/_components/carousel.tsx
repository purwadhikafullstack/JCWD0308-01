import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { type CarouselApi } from "@/components/ui/carousel"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { IProduct } from "@/constants"
import Image from "next/image"


interface ICarousel {
  product:IProduct
  setIndex: React.Dispatch<React.SetStateAction<number>>
  index: number
}

export function ProductCarousel({product, setIndex, index}:ICarousel) {
  const [api, setApi] = React.useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  
  useEffect(() => {
    if (api) {
      const num = api.slidesInView()
      setCurrent(num[0])
    }
  }, [, index, api])
  

  useEffect(() => {
    if (api) {
       api.scrollTo(index)
    }
    },[index, api])


  return (
    <Carousel className="w-[320px] h-[320px]  sm:w-[500px] sm:h-[500px]  md:w-[330px] md:h-[330px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px] relative rounded-none group" setApi={setApi}>
      <CarouselContent>
      <CarouselItem>
            <div>
              <Card className="rounded-none">
                <CardContent className="flex p-0 aspect-square items-center justify-center">
                  <Image alt={product.id} src={product.thumbnailURL} width={500} height={500} className="object-cover object-center sm:w-[500x] sm:h-[500] md:w-[330px] md:h-[330px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px]"/>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        {product.images.map((item, index) => (
          <CarouselItem key={index}>
            <div>
              <Card className="rounded-none">
                <CardContent className="flex p-0 aspect-square items-center justify-center">
                  <Image alt={item.image} src={item.image} width={500} height={500} className="object-cover object-center w-[320px] h-[320px]  sm:w-[500px] sm:h-[500px] md:w-[330px] md:h-[330px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px]"/>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
         {product.variants.map((item, index) => (
          <CarouselItem id={item.id} key={index} className="">
            <div>
              <Card className="rounded-none ">
                <CardContent className="flex p-0 aspect-square items-center justify-center ">
                  <Image alt={item.image} src={item.image} width={500} height={500} className="object-cover object-center w-[320px] h-[320px]  sm:w-[500px] sm:h-[500px] md:w-[330px] md:h-[330px] lg:w-[400px] lg:h-[400px] xl:w-[500px] xl:h-[500px]"/>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-1 md:group-hover:flex md:hidden" />
      <CarouselNext className="absolute right-1 md:group-hover:flex md:hidden"/>
    </Carousel>
  )
}
