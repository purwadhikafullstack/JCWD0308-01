'use client'
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { PiMagnifyingGlass } from 'react-icons/pi'
import { useDebouncedCallback } from 'use-debounce'
import { getProductName } from '@/app/action'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface INameArr {
	name: string
	slug: string
}

export const Search = () => {
	const [value, setValue] = useState('')
	const [search, setSearch] = useState('')
	const router = useRouter()
	const [nameArr, setNameArr] = useState<INameArr[]>([])
	const [focus, setFocus] = useState(false)
  
	const debounced = useDebouncedCallback(
    (value) => {
        setValue(value);
      },
      500
  )

	const handleSubmit = (e:any) => {
		if (search.length > 0) {
			router.push(`/catalogs?q=${search.toLowerCase().replaceAll(' ', '-')}`)
			e.preventDefault()
		}
	}
	
	useEffect(()=> {
		if (value.length > 0) {
			const getData = async() => {
				const res = await getProductName(value)
				if (res.status === 'ok') setNameArr(res.data)
			}
			getData()
		} else {
			setNameArr([])
		}
	}, [value])  
  
  return (
    <form onSubmit={handleSubmit}>
        <div className="relative">
            <Input 
                type="text" 
                placeholder="Search" 
                className="focus-visible:ring-white/0 w-56 focus-visible:border-black/80 duration-200"
                onChange={(e) => {debounced(e.target.value); setSearch(e.target.value)}}
				onFocus={() => setFocus(true)}
				onBlur={() => setFocus(false)}
            />
            <PiMagnifyingGlass className="absolute top-0 bottom-0 right-4 m-auto fill-black/50" />
        </div>
        <div className={`absolute bg-white w-56 border-[1px] p-2 border-black/15 rounded-lg top-12 flex flex-col gap-1 ${nameArr.length > 0 && focus ? '' : 'hidden'}`}>
				{
					nameArr.map((item, index:number) => {
						return (
							<Link href={`/products/${item.slug}`} key={index} className='p-1 text-sm truncate hover:bg-secondary rounded-md'>
									{item.name}
							</Link>
						)
					})
				}
        </div>
    </form>
  )
}
