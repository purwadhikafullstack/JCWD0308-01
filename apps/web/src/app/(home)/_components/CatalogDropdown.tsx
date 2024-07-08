import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import React from "react"
import { PiFireSimple, PiGenderFemale, PiGenderMale } from "react-icons/pi";

export default function CatalogDropdown() {
    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild className="border-0 focus-visible:ring-black/0 focus-visible:border-black/60">
                    <Button variant="outline">Catalog<ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-data-[state=open]:rotate-180" aria-hidden="true"/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-md:hidden lg:hidden">        
                    <DropdownMenuGroup>
                        <Link href={'/user/edit-profile'}>
                            <DropdownMenuItem className="flex gap-2 cursor-pointer">
                                <PiFireSimple size={`16px`} />
                                <span>New Arrival</span>
                            </DropdownMenuItem>
                        </Link>
                        <DropdownMenuItem className="flex gap-2 cursor-pointer">
                            <PiGenderFemale size={`16px`} />
                            <span>Women</span>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuItem className="flex gap-2 cursor-pointer">
                        <PiGenderMale size={`16px`} />
                        <span>Men</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
};

