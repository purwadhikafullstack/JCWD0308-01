import React from "react"
import Link from "next/link"
import { PiArrowsLeftRight, PiBriefcase, PiLego, PiNewspaper, PiTShirt, PiUsers, PiWarehouse,PiCurrencyCircleDollar } from "react-icons/pi"
import { Separator } from "../ui/separator"

export default function AdminMenu({ role, activeButton }: { role: string | null, activeButton: string }) {

    return (
        <ul className='flex flex-col gap-10'>
            <div className="space-y-4 ">
                {/* <li className="flex items-center gap-2"><PiLego size={`1.25rem`}/><Link href={'/admins/overview'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'overview' ? 'font-bold' : ''}`}>Overview</Link></li> */}
                <li className="flex items-center gap-2"><PiTShirt size={`1.25rem`}/><Link href={'/admins/products'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'products' ? 'font-bold' : ''}`}>Products</Link></li>
                <li className="flex items-center gap-2"><PiArrowsLeftRight size={`1.25rem`} /><Link href={'/admins/stocks'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'stocks' ? 'font-bold' : ''}`}>Stocks</Link></li>
                <li className="flex items-center gap-2"><PiNewspaper size={`1.25rem`}/><Link href={'/admins/transactions'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'transactions' ? 'font-bold' : ''}`}>Transactions</Link></li>
                <li className="flex items-center gap-2"><PiCurrencyCircleDollar size={`1.25rem`}/><Link href={'/admins/sales'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'sales' ? 'font-bold' : ''}`}>Sales</Link></li>
            </div>
            { role == 'superAdm' && <Separator /> }
            <div className="space-y-4 ">
                {
                    role == 'superAdm' && 
                    <>
                        <li className="flex items-center gap-2"><PiWarehouse size={`1.25rem`} /><Link href={'/admins/warehouses'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'warehouses' ? 'font-bold' : ''}`}>Warehouses</Link></li>
                        <li className="flex items-center gap-2"><PiBriefcase size={`1.25rem`}/><Link href={'/admins/admins'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'admins' ? 'font-bold' : ''}`}>Admins</Link></li>
                        <li className="flex items-center gap-2"><PiUsers size={`1.25rem`} /><Link href={'/admins/users'} className={`duration-300 hover:cursor-pointer hover:text-gray-500 ${activeButton === 'users' ? 'font-bold' : ''}`}>Users</Link></li>
                    </>
                }
            </div>
        </ul>
    )
};

