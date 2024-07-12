'use client'
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
  } from "@/components/ui/pagination"
import { useEffect, useState } from "react"
import { PiCaretLeftBold, PiCaretRightBold } from "react-icons/pi";

  interface IPagination {
    setPage: React.Dispatch<React.SetStateAction<number>>
    productQty: number
    page: number
    limiter: number
  }
  
  export function PaginationTemplate({setPage, productQty, page, limiter}:IPagination) {
    const [limit, setLimit] = useState(1)

    useEffect(() => {
      const pageLimit = productQty % limiter === 0 ? productQty/limiter : Math.floor(productQty/limiter) + 1
     setLimit(pageLimit)
    }, [productQty, limiter])
    


    return (
      <Pagination className="mt-2">
          <PaginationContent className="gap-0">
            <PaginationItem>
              <PaginationLink href={`#${page}`}  className={'mr-1'} onClick={() =>{ if (page - 1 > 0) setPage(page - 1)}}><PiCaretLeftBold /></PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`#${page}`}  className={page - 2 <= 0  || page !== limit ? "hidden" : 'mr-1'} onClick={() => setPage(page - 2)}>{page - 2}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`#${page}`} className={page - 1 == 0 ? "hidden" : 'mr-1'} onClick={() => setPage(page -1 )}>{page - 1}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`#${page}`} isActive={true} onClick={() => setPage(page)}>{page}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`#${page}`}  className={page + 1 > limit ? "hidden" : 'ml-1'} onClick={() => setPage(page + 1)}>{page + 1}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`#${page}`}  className={page + 1 >= limit  || page - 1 !== 0  ? "hidden" : 'ml-1'} onClick={() => setPage(page + 2)}>{page + 2}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href={`#${page}`}  className={'mr-1'} onClick={() =>{ if (page + 1 < limit+1) setPage(page + 1)}}><PiCaretRightBold /></PaginationLink>
            </PaginationItem>
          </PaginationContent>
      </Pagination>
    )
  }
  