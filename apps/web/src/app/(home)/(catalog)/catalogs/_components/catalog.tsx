'use client'
import { getCatalog } from '@/app/action'
import { Selector } from '@/app/(dashboard)/_components/manageProductModal/selector'
import { IProduct } from '@/constants'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import LoadingCatalog from './loadingCatalog'
import { PaginationTemplate } from '@/components/pagination'

export const Catalogs = () => {
  const router = useRouter()
  const params = useSearchParams()
  const [sort, setSort] = useState('Newest')
  const [productQty, setProductQty] = useState(0)
  const [page, setPage] = useState(1)
  const [productList, setProductList] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const getData = async(p: number) => {
      setIsLoading(true)
      const gender = params.get('g')
      const type = params.get('t')
      const category = params.get('c')
      const q = params.get('q')
      let s = sort.toLowerCase().replaceAll(' ', '-')
      const product = await getCatalog(gender || '', type || '', category || '', q || '',  s,  String(p))
      if (product.status == 'ok') {
        setProductQty(product.totalProduct)
        setProductList(product.productList)
        setIsLoading(false)
      }
    }
    getData(page)
  }, [params, page, sort])

  return (
    <div className={`w-full ${isLoading ? 'h-screen' : ''}`}>
      <div className="flex justify-between mb-10 lg:px-5 xl:px-3">
        <div>
        <p>Results</p>
        <p className='text-3xl h-full'>{productQty}</p>
        </div>

        <div className= {`${productQty == 0? 'hidden' : ''} w-40`}>
            <p className='text-right mb-1'>Sort by:</p>
            <Selector 
            label="Sort by"
            state={['Newest', 'Low to high', 'High to low']}
            setState={setSort}
            defValue={sort}
            />
        </div>
      </div>
      <div className={`grid grid-cols-2 xl:grid-cols-3 w-full gap-3 sm:gap-10 justify-items-center`}>
        { isLoading ?
          Array.from({ length: 3 }).map((_, index) => (
          <LoadingCatalog key={index} />
          )) 
          :
          productList.map((item) => {
            return (
                <div 
                key={item.id} 
                className='w-40 h-[280px] sm:w-60 sm:h-[25rem] hover:cursor-pointer items flex flex-col bg-white rounded-md drop-shadow-[0_5px_5px_rgba(0,0,0,0.05)]' 
                onClick={() => router.push(`/products/${item.slug}`)} 
                >
                  <Image 
                    alt={item.slug} 
                    width={240}
                    height={240}
                    className={`object-cover object-center sm:w-[240px] sm:h-[240px] rounded-t-md ${item.totalStock == 0 ? 'saturate-0' : ''}`}
                    src={item.thumbnailURL} 
                  />
                  <div className='flex flex-col grow p-3 pt-0 pb-3 sm:pb-4'>
                    <div className='flex justify-between my-2 text-[0.5rem] sm:text-xs'>
                      <p className='font-semibold text-slate-500'>{item.category.gender}</p>
                      <p className='font-semibold text-slate-500'>{item.oneSize ? 'One size' : 'S - XL'}</p>
                    </div>

                    <div className='flex justify-start gap-1'>
                      {item.variants.map(variant => {
                        const borderColor = variant.HEX.slice(3, 4).toUpperCase() === 'F';
                        return (
                          <div 
                            key={variant.id} 
                            style={{ background: `${variant.HEX}` }} 
                            className={`w-3 h-3 sm:w-5 sm:h-5 ${borderColor ? "border-[1px] border-slate-400" : ''}`} 
                          ></div>
                        );
                      })}
                    </div>
                  
                    <div className='flex flex-col justify-between grow mt-2'>
                      <p className='text-sm sm:text-xl font-semibold'>{item.name}</p>
                      <p className='text-xs sm:text-base'>Rp{new Intl.NumberFormat('en-DE').format(item.price)}</p>
                    </div>
                  </div>
                </div>
            );
          })
        }
      </div>

      <div className={`py-10 ${productQty == 0? 'hidden' : ''}`}>
        <PaginationTemplate
        productQty={productQty}
        page={page}
        setPage={setPage}
        />
      </div>


    </div>
  )
}
