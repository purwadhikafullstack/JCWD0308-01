'use client'
import React, { useEffect, useState } from "react"
import Link from "next/link"
import { cn, getUserClientSide, shuffleArray } from "@/lib/utils"
import Cookies from "js-cookie";
import { isTokenExp } from "@/lib/utils";
import { PiStackSimple } from "react-icons/pi";
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu"
import { HeaderDropdown } from "../app/(home)/_components/HeaderDropdown";
import AccountMenu from "@/app/(home)/_components/AccountMenu";
import CatalogDropdown from "@/app/(home)/_components/CatalogDropdown";
import { useRouter } from "next/navigation"
import { Search } from "./search";
import { toast } from "sonner";
import { getRequest } from "@/lib/fetchRequests";
import { ICategory, IProduct } from "@/constants";
import { Spinner } from "./ui/spinner";
import { IUser } from "@/app/(home)/(user-dashboard)/user/edit-profile/_components/EditProfileForm";
import Cart from "./cart/Cart";

const components: { title: string; href: string; description: string }[] = [
    {
        title: "Alert Dialog",
        href: "/docs/primitives/alert-dialog",
        description:
            "A modal dialog that interrupts the user with important content and expects a response.",
    },
    {
        title: "Hover Card",
        href: "/docs/primitives/hover-card",
        description:
            "For sighted users to preview content available behind a link.",
    },
    {
        title: "Progress",
        href: "/docs/primitives/progress",
        description:
            "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
    },
    {
        title: "Scroll-area",
        href: "/docs/primitives/scroll-area",
        description: "Visually or semantically separates content.",
    },
    {
        title: "Tabs",
        href: "/docs/primitives/tabs",
        description:
            "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
    },
    {
        title: "Tooltip",
        href: "/docs/primitives/tooltip",
        description:
            "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
    },
]

export function Header() {

    const [userLogged, setUserLogged] = useState(false);
    const [ menCategories, setMenCategories ] = useState([]);
    const [ womenCategories, setWomenCategories ] = useState([]);
    const [ currentUser, setCurrentUser ] = useState<IUser | null | undefined>();
    const [ wishlistItems, setWishlistItems ] = useState<IProduct[] | []>();
    const router = useRouter()
    async function getUser() {
        const user  = await getUserClientSide()
        setCurrentUser(user)
    }

    async function fetchMenCategory() {
        try {
            const res = await getRequest(`categories/men-cat`);
            const data = await res.json()
            if (res.ok) setMenCategories(data.data)
        } catch (error) {
            toast.error(error instanceof Error ? error.message: "Error while fetching men categories")
        }
    }

    async function fetchWomenCategory() {
        try {
            const res = await getRequest(`categories/women-cat`);
            const data = await res.json()
            if (res.ok) setWomenCategories(data.data)
        } catch (error) {
            toast.error(error instanceof Error ? error.message: "Error while fetching men categories")
        }
    }

    async function getWishlistItems() {
        try {
            if (currentUser) {
                const res = await getRequest(`wishlist/${currentUser?.id}`)
                const data = await res.json();
                setWishlistItems(data.data)
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'error fetching wishlist')
        }
    }

    useEffect(() => {
        const token = Cookies.get('token')
        const role = Cookies.get('role')
        if (token && (role == 'user' && !isTokenExp(token))) setUserLogged(true)
        getUser()
        fetchMenCategory()
        fetchWomenCategory()
    }, [])

    useEffect(() => {
        getWishlistItems()
    }, [ currentUser ])

    return (
        <div className="p-4 flex justify-center border-b-[1px] sticky top-0 bg-white z-50">
            <NavigationMenu>
                <NavigationMenuList className="justify-between w-screen md:w-[40rem] lg:w-[50rem] xl:w-[65rem] duration-200">

                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                                <span className={`font-light text-xl`}>WearDrobe</span>
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>

                    <div className="md:flex">
                        <NavigationMenuItem className="max-[550px]:hidden">
                            <div className="relative"><Search /></div>
                        </NavigationMenuItem>

                        <div className="hidden lg:flex">
                            <NavigationMenuItem>
                                <Link href="/catalogs" legacyBehavior passHref>
                                    <NavigationMenuLink className={`${navigationMenuTriggerStyle()} flex gap-2`}>
                                        Catalog <PiStackSimple size={`1.1rem`} />
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Women</NavigationMenuTrigger>
                                <NavigationMenuContent className="max-lg:hidden">
                                    <ul className={`grid w-[600px] gap-3 p-4 md:grid-cols-4 relative ${ womenCategories.length > 0 ? '' : 'lg:py-6' }`}>
                                        {   
                                            womenCategories && womenCategories.length > 0 ?
                                            shuffleArray(womenCategories).map((item: ICategory) => (
                                                <ListItem
                                                    key={item.id}
                                                    title={item.category}
                                                    href={`/catalogs?g=women&t=${item.type}&c=${item.slug}`}
                                                />
                                            ))
                                            :
                                            <div className="flex items-center justify-center absolute text-center w-full gap-4 text-black/70 h-full">
                                                <Spinner size={'small'} /><span>Fetching categories. Please wait..</span>
                                            </div>
                                        }
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuTrigger>Men</NavigationMenuTrigger>
                                <NavigationMenuContent className="max-lg:hidden">
                                    <ul className={`grid w-[600px] gap-3 p-4 md:grid-cols-4 relative ${ menCategories.length > 0 ? '' : 'lg:py-6' }`}>
                                        {   
                                            menCategories && menCategories.length > 0 ?
                                            shuffleArray(menCategories).map((item: ICategory) => (
                                                <ListItem
                                                    key={item.id}
                                                    title={item.category}
                                                    href={`/catalogs?g=Men&t=${item.type}&c=${item.category}`}
                                                />
                                            ))
                                            :
                                            <div className="flex items-center justify-center absolute text-center w-full gap-4 text-black/70 h-full">
                                                <Spinner size={'small'} /><span>Fetching categories. Please wait..</span>
                                            </div>
                                        }
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </div>

                        <NavigationMenu className="hidden md:block lg:hidden">
                            <CatalogDropdown />
                        </NavigationMenu>
                    </div>

                    <NavigationMenuItem className="hidden md:flex">
                        <AccountMenu wishlistItems={wishlistItems} userLogged={userLogged} router={router} />
                    </NavigationMenuItem>

                    <NavigationMenuItem className="flex gap-2 items-center md:hidden">
                        {userLogged && (
                            <Cart />
                        )}
                        <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                            <HeaderDropdown wishlistItems={wishlistItems} userLogged={userLogged} router={router} menCategories={menCategories} womenCategories={womenCategories} />
                        </NavigationMenuLink>
                    </NavigationMenuItem>

                </NavigationMenuList>
            </NavigationMenu>
        </div >
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-normal text-black/80 leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
