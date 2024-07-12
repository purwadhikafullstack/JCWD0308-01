'use client'
import { getCatalog } from '@/app/action'
import { Selector } from '@/components/selector'
import { IProduct } from '@/constants'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import LoadingCatalog from './loadingCatalog'
import { PaginationTemplate } from '@/components/pagination'
import Link from 'next/link'
import { ProductCard } from '@/components/ui/productCard'

export const Catalogs = () => {
  const params = useSearchParams()
  const [sort, setSort] = useState('Newest')
  const [productQty, setProductQty] = useState(0)
  const [page, setPage] = useState(1)
  const [productList, setProductList] = useState<IProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const limiter = 9

  useEffect(() => {
    const getData = async(p: number) => {
      window.scrollTo(0, 0);
      setIsLoading(true)
      const gender = params.get('g')
      const type = params.get('t')
      const category = params.get('c')
      const q = params.get('q')
      let s = sort.toLowerCase().replaceAll(' ', '-')
      const product = await getCatalog(gender || '', type || '', category || '', q || '',  s,  String(p), String(limiter))
      if (product.status == 'ok') {
        setProductQty(product.totalProduct)
        setProductList(product.productList)
        setIsLoading(false)
      }
    }
    getData(page)
  }, [params, page, sort])

  console.log(productQty);
  

  return (
    <div className={`w-full flex flex-col justify-between min-w-[332px] sm:min-w-[520px] xl:min-w-[800px] ${productQty == 0 && !isLoading ? 'h-[100vh]' : 'min-h-[50vh]'}`}>
      <div>
        <div className="flex justify-between mb-10 lg:px-5 xl:px-3">
          <div>
          <p>Results</p>
          <p className='text-3xl h-full'>{productQty}</p>
          </div>

          <div className= {`w-40`}>
              <p className='text-right mb-1'>Sort by:</p>
              <Selector 
              label="Sort by"
              state={['Newest', 'Low to high', 'High to low', 'A-Z']}
              setState={setSort}
              defValue={sort}
              />
          </div>
        </div>
        <div className={`grid grid-cols-2 xl:grid-cols-3 w-full gap-3 sm:gap-10 justify-items-center ${productQty == 0 && !isLoading ? 'hidden' : ''}`}>
          { isLoading ?
            Array.from({ length: 3 }).map((_, index) => (
            <LoadingCatalog key={index} />
            )) 
            :
            productList.map((item) => {
              return (
                <div key={item.id}>
                    <ProductCard 
                    gender={item.category.gender}
                    name={item.name}
                    oneSize={item.oneSize}
                    price={item.price}
                    slug={item.slug}
                    thumbnailURL={item.thumbnailURL}
                    totalStock={item.totalStock}
                    variants={item.variants}
                    />
                </div>
              );
            })
          }
        </div>

        <div className={`${productQty == 0 && !isLoading ? '' : 'hidden'} flex justify-center items-center max-lg:h-[40vh] mb-10`}>
          <p className='text-gray-500'>No products available.</p>
        </div>
      </div>

      <div className={`py-10 ${productQty == 0? 'hidden' : ''}`}>
        <PaginationTemplate
        limiter={limiter}
        productQty={productQty}
        page={page}
        setPage={setPage}
        />
      </div>


    </div>
  )
}
