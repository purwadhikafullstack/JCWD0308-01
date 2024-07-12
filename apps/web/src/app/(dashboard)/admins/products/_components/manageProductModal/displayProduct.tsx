import React, { useEffect, useState } from 'react'
import { ProdTable } from './prodTable'
import { PaginationTemplate } from '@/components/pagination'
import { Input } from "@/components/ui/input"
import { PiMagnifyingGlass } from "react-icons/pi";
import { IProduct, IProductList } from '@/constants'

interface IAdminProduct {
	page: number
	setPage: React.Dispatch<React.SetStateAction<number>>
	getData: () => void
	productList: IProduct[]
	productQty: number
	isSuper: boolean
}

export const AdminProductDisplay = ({page, setPage, getData,productList, productQty,isSuper}:IAdminProduct) => {
	
	return (
		<div className='w-full'>
			<ProdTable 
				productList={productList}
				action={() =>getData()}
				isSuper={isSuper}
				page={page}
			/>
			<PaginationTemplate
			limiter={10}
			setPage={setPage}
			page={page}
			productQty={productQty}
			/>
		</div>
	)
}
