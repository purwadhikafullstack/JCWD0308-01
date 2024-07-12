'use client'
import React, { useEffect, useState } from 'react'
import { GenderDropdown } from './genderDropdown'
import { CatAccordion } from './catAccordion'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface IActiveCat {
  g:string, t: string, c:string
}

export const CatalogSidebar = () => {
  const params= useSearchParams()
  const [gender, setGender] = useState('Women')
  const [activeCat, setActiveCat] = useState<IActiveCat>({g:'', t:'', c:''})
  
  useEffect(() => {
    const g = params.get('g')
    const t = params.get('t')
    const c = params.get('c')
    if (g) setGender(g.charAt(0).toUpperCase() + g.slice(1))
      if (!g) setGender('Women')
    setActiveCat({g:g || '', t:t || '', c:c || ''})
  }, [params])
  
  return (
    <div className='max-lg:hidden lg:min-w-[16rem] xl:min-w-[18rem] h-fit border-[1px] border-black/15  p-5 sticky top-32 mb-36'>
        <p>Select gender:</p>
        <GenderDropdown 
            gender={gender}
            setGender={setGender}
            genderList={['Women', 'Men', 'Unisex']}
        />
        
        <div className='mt-5 flex'>
          <Link href={`/catalogs?g=${(gender.toLowerCase())}`}>
          <p 
          className={`text-black text-sm hover:font-semibold duration-200 ${activeCat.c == '' && activeCat.t == ''  && activeCat.g.toLowerCase() == gender.toLowerCase() ? 'font-semibold' : ''}`}
          >{`All ${gender.at(0) + gender.toLowerCase().slice(1)}'s Collections`}</p>
          </Link>
        </div>
        
        <CatAccordion
        gender={gender}
        activeCat={activeCat!}
        />


    </div>
  )
}
