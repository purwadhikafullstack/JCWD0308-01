'use client'
import React, { useEffect, useState } from 'react'
import { Input } from "@/components/ui/input"
import { PiMagnifyingGlass } from 'react-icons/pi'
import { useDebouncedCallback } from 'use-debounce'
import { getProductName } from '@/app/action'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Separator } from './ui/separator'

interface INameArr {
	name: string
	slug: string
}

export const Search = () => {
	const [value, setValue] = useState('')
	const [search, setSearch] = useState('')
	const router = useRouter()
	const [nameArr, setNameArr] = useState<INameArr[] | []>([])
    const [focus, setFocus] = useState(false)
  
	const debounced = useDebouncedCallback(
    (value) => {
        setValue(value);
      },
      500
    )

	const handleSubmit = (e:any) => {
		if (search.length > 0) {
			router.push(`/catalogs?q=${search}`)
			e.preventDefault()
		}
        setValue('')
        setSearch('')
	}
	
	useEffect(()=> {
		if (value.length > 0) {
			const getData = async() => {
				const res = await getProductName(value)
				if (res.status === 'ok') setNameArr(res.data)
			}
			getData()
		} 
	}, [value])  
  
  return (
    <form onSubmit={handleSubmit}>
        <div className="relative">
            <Input 
                type="text" 
                placeholder="Search" 
                className="group max-lg:w-full focus-visible:ring-white/0 w-56 focus-visible:border-black/80 duration-200"
                onChange={(e) => {debounced(e.target.value); setSearch(e.target.value)}}
				onFocus={() => setFocus(true)}
				onBlur={() => setTimeout(() => {
                    setFocus(false);
                }, 100)}
            />
            <PiMagnifyingGlass className="absolute top-0 bottom-0 right-4 m-auto fill-black/50" />
        </div>
        <div className={focus ? '' : 'hidden'}>
            {   nameArr?.length > 0 ?
                    <div className={`z-[1] absolute bg-white w-56 border-[1px] p-2 border-black/15 rounded-lg top-12 flex flex-col gap-1 ${ value ? '' : 'hidden' } `}>
                        {
                            nameArr?.map((item, index:number) => {
                                return (
                                    index < 4 &&
                                    <Link href={`/products/${item.slug}`} key={index} className='p-1 text-black/65 text-sm truncate hover:bg-secondary rounded-md'>
                                        {item.name}
                                    </Link>
                                )
                            })
                        }
                        <Separator />
                        <span onClick={handleSubmit} className='p-1 font-semibold text-center text-sm truncate hover:bg-secondary rounded-md cursor-pointer'>
                            Load more results
                        </span>
                    </div>
                :
                <div className={`absolute bg-white w-56 border-[1px] p-2 border-black/15 rounded-lg top-12 flex flex-col gap-1 ${ value ? '' : 'hidden' } `}>
                    <span className='p-1 text-sm truncate hover:bg-secondary rounded-md'>Product not found...</span>
                </div>
            }
        </div>
    </form>
  )
}
