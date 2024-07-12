'use client'
import { getProductSlug } from "@/app/action";
import { Separator } from "@/components/ui/separator";
import { ProductMenu } from "../_components/menu";
import { ProductCarousel } from "../_components/carousel";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IProduct, ISizeSum } from "@/constants";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
import Link from "next/link";
import { RowCarousel } from "../_components/rowCarousel";
import { RecommendedCarousel } from "../_components/recomendedCarousel";
import { Breadcrumbs } from "../_components/breadcrumbs";
import { toast } from "sonner";
import { ProductSkeleton } from "../_components/skeleton";



export default function Page() {
    const {slug} = useParams()
    const [product, setProduct] = useState<IProduct>()
    const [gender, setGender] = useState('')
    const [type, setType] = useState('')
    const [category, setCategory] = useState('')
    const [index, setIndex] = useState(0)
    const [sizeSum, setSizeSum] = useState<ISizeSum[]>([])
    const router = useRouter()


    useEffect(() => {
    const getData = async() => {
        try {
            const data = await getProductSlug(String(slug), '', '')
            if (data.status == 'error') throw data.message
            setProduct(data.productList)
            setSizeSum(data.sizeSum)
            setGender(String(data.productList.category.gender).at(0) + String(data.productList.category.gender).slice(1).toLowerCase())
            setType(String(data.productList.category.type).at(0) + String(data.productList.category.type).slice(1).toLowerCase())
            setCategory(String(data.productList.category.category).at(0) + String(data.productList.category.category).slice(1).toLowerCase())
        } catch (error:any) {
            typeof(error) == 'string' ? toast.error(error) :  toast.error('Failed to get product informations.')
            router.push('/catalogs')
        }
       
    }
    getData()
    }, [slug, router])

    return (
        <div className="w-full min-h-[100vh] flex justify-center">
            {
                product ?
                <div className="pt-5 pb-20 w-[320px] sm:w-[620px] md:w-[700px] lg:w-[850px] xl:w-[1100px]">
                    <Breadcrumbs gender={gender} type={type} category={category} />
                    <div className=" flex max-md:justify-center justify-between">
                        <div className="w-full sm:w-[500px] md:w-[330px] lg:w-[400px] xl:w-[500px]">
                            <ProductCarousel product={product} index={index} setIndex={setIndex}/>
                            <RowCarousel product={product}  index={index} setIndex={setIndex}/>

                            <div className="md:hidden">
                                <Separator className="my-3"/>
                                <div className="flex flex-col w-full md:mb-20">
                                    <p className="text-2xl sm:text-3xl md:text-4xl xl:text-6xl font-semibold mb-2 sm:mb-5 md:mb-10">{product.name}</p>
                                    <div className="font-medium flex items-end">
                                        <p className="sm:text-xl">Rp</p>
                                        <p className="text-xl sm:text-2xl xl:text-4xl font-medium">{new Intl.NumberFormat('en-DE').format(product.price)}</p>
                                    </div>
                                    <Separator className="mt-3 mb-5"/>
                                    <ProductMenu 
                                    setIndex={setIndex}
                                    product={product}
                                    sizeSum={sizeSum}
                                    />
                                </div>
                                <Separator className="mt-5 mb-3"/>
                            </div>

                            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                                <AccordionItem className="mt-10" value="item-1">
                                    <AccordionTrigger>Description</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="leading-7 text-justify text-pretty indent-7 mb-5">{product.description}</p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                            <Accordion type="single" collapsible className="w-full" defaultValue="item-1">
                                <AccordionItem value="item-2">
                                    <AccordionTrigger>Details</AccordionTrigger>
                                    <AccordionContent>
                                        <div className="">
                                            <div className="flex justify-between">
                                                <p>Gender</p>
                                                <Link className="font-semibold hover:underline" href={`/catalogs?g=${gender}`}>{gender}</Link>
                                            </div>
                                            <div className="flex justify-between my-3">
                                                <p>Type</p>
                                                <Link className="font-semibold hover:underline" href={`/catalogs?g=${gender}&t=${type}`}>{type}</Link>
                                            </div>
                                            <div className="flex justify-between">
                                                <p>Category</p>
                                                <Link className="font-semibold hover:underline" href={`/catalogs?g=${gender}&t=${type}&c=${category}`}>{category}</Link>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="mt-20 md:hidden">
                                <p className="text-4xl">You may also like</p>
                                <RecommendedCarousel gender={gender} type={type}/>
                            </div>
                        </div>
                        
                        <div className="min-h-full max-md:hidden">
                            <div className="flex flex-col sm:w-[500px] md:w-[330px] lg:w-[400px] xl:w-[500px] sticky top-32 mb-10 rounded-lg p-10 bg-white drop-shadow-[0_10px_15px_rgba(0,0,0,0.07)]">
                                <p className="text-4xl xl:text-6xl font-semibold mb-10">{product.name}</p>
                                <div className="font-medium flex items-end">
                                    <p className="text-xl">Rp</p>
                                    <p className="text-2xl xl:text-4xl font-medium">{new Intl.NumberFormat('en-DE').format(product.price)}</p>
                                </div>
                                <Separator className="my-3"/>
                                <ProductMenu 
                                setIndex={setIndex}
                                product={product}
                                sizeSum={sizeSum}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 max-md:hidden">
                        <p className="text-4xl">You may also like</p>
                        <RecommendedCarousel gender={gender} type={type}/>
                    </div>
                </div>
                
                :
                <ProductSkeleton />
            }
        </div>
    )
}