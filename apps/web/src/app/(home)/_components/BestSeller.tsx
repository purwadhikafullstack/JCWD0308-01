import * as React from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel/carousel"
import { formatToIDR, getUserClientSide } from "@/lib/utils";
import Image from "next/image";
import { IProduct } from "@/constants";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import WishlistLikedBtn from "@/components/WishlistLikedBtn";
import { toast } from "sonner";
import { postRequest } from "@/lib/fetchRequests";
import { IUser } from "../(user-dashboard)/user/edit-profile/_components/EditProfileForm";


export default function BestSeller({ all, headerText, totalCol, data }: { all: boolean, headerText: string, totalCol?: "sm:basis-1/2" | "sm:basis-1/3", data: IProduct[]|[] }) {
    const [ currentUser, setCurrentUser ] = React.useState<IUser | null>()
    const router = useRouter();

    async function handleCreateWishlist(product : IProduct) {
        try {
            if (currentUser && product) {
                const res = await postRequest({ userId: currentUser?.id, productId: product.id }, 'wishlist/')
                const data = await res.json()
                if (res.ok) {
                    toast.success(data.message)
                    router.refresh();
                }
            } else {
                toast.warning(`You need to login to add ${ product && product?.name ? product.name : 'item' } to wishlist`)
            }

        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while saving item to your wishlist")
        }
    }

    async function getWishlist(product: IProduct) {
        try {
            if (currentUser && product) {
                const res = await postRequest({ userId: currentUser?.id, productId: product.id }, 'wishlist/get-wishlist/')
                // if (res.ok) isLiked = true 
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Error while checking this item on your wishlist")
        }
    }

    async function getUser() {
        const user = await getUserClientSide()
        setCurrentUser(user)
    }

    React.useEffect(() => {
        getUser()
    }, [ ])
        
    

    return (
        <div className="flex flex-col items-center sm:items-start">
            <div className="lg:py-4 sm:px-0 duration-200 flex items-center justify-between w-full">
                <h2 className="mb-2 text-lg font-bold text-center sm:text-start">{ headerText }</h2>
                <span className="text-black/40 text-sm md:hidden max-sm:hidden max-[400px]:block max-[400px]:text-xs max-[400px]:text-black/30 ">swipe left</span>
            </div>

            <Carousel opts={{ align: "start", }} className="max-w-72 sm:max-w-[40rem] lg:max-w-[50rem] xl:max-w-[65rem] ">
                <CarouselContent className="">
                    {
                        data.length > 0 ?
                        data.map((item, idx) => {

                            return <CarouselItem key={idx} className={` ${ totalCol ? totalCol: 'sm:basis-1/2 lg:basis-1/3' } flex flex-col items-stretch`}>
                                <div onClick={() => router.push(`products/${item.slug}`) } className="cursor-pointer relative w-full">
                                    <Image
                                        priority
                                        width={350} height={100}
                                        className={`rounded-lg object-cover h-[300px]`} src={item.thumbnailURL} alt="" 
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">{ item.name }</p>
                                        <p className="font-light">{ formatToIDR(item.price) }</p>
                                    </div>
                                    {/* <WishlistLikedBtn func={handleLike} isLiked={isLiked} /> */}
                                </div>
                            </CarouselItem>
                        })
                        :
                        <div className="flex gap-4">
                            <Skeleton className="h-[400px] w-[400px] rounded-xl" />
                            <Skeleton className="h-[400px] w-[400px] rounded-xl" />
                            <Skeleton className="h-[400px] w-[400px] rounded-xl" />
                        </div>
                    }
                </CarouselContent>
                <div className="hidden md:block max-sm:block max-[400px]:hidden">
                    <CarouselNext />
                    <CarouselPrevious />
                </div>
            </Carousel>
        </div>
  )
}
