import React, { useCallback, useEffect, useState } from 'react'
import OrderTable from './manageOrderList/OrderTable'
import { IOrder } from '@/constants'
import { getAllOrder } from '@/lib/cart'
import { formUrlQuery, getAdminClientSide, getUserClientSide, removeKeysFromQuery } from '@/lib/utils'
import SearchOrder from './manageOrderList/SearchOrder'
import { useRouter, useSearchParams } from 'next/navigation'
import PaginationOrder from './manageOrderList/PaginationOrder'
import { DateRange } from 'react-day-picker'

type DisplayOrderProps = {
    warehouse?: string
}

const monthFirstDate = () => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function DisplayOrder({ warehouse }: DisplayOrderProps) {
    const [orderList, setOrderList] = useState<IOrder[] | null>(null)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrectPage] = useState(1)
    const [date, setDate] = useState<DateRange | undefined>({
        from: monthFirstDate(),
        to: new Date(),
    })
    const search = useSearchParams()
    const searchQuery = search ? search.get('q') : null
    const warehouseQuery = search ? search.get('w') : null
    const encodedsSearchQuery = encodeURI(searchQuery || '')
    const encodedsWarehouseQuery = encodeURI(warehouseQuery || '')
    const limitQuery = search ? search.get('limit') : '10';
    const currentQuery = search ? search.get('page') : '1';
    const router = useRouter()

    const warehouseData = useCallback(async (warehouse: string) => {
        if (warehouse !== 'Not Assigned' && warehouse !== '') {
            let newUrl = ''
            if (warehouse && warehouse !== 'All Warehouses') {
                newUrl = formUrlQuery({
                    params: search.toString(),
                    key: 'w',
                    value: warehouse
                })
            } else {
                newUrl = removeKeysFromQuery({
                    params: search.toString(),
                    keysToRemove: ['w']
                })
            }
            router.push(newUrl, { scroll: false });
        }
    }, [router, search])

    useEffect(() => {
        if (warehouse) {
            warehouseData(warehouse)
        }
    }, [warehouse, warehouseData])

    const getOrder = useCallback(async () => {
        const dataUser = await getUserClientSide()
        const dataAdmin = await getAdminClientSide()
        if (dataUser) {
            const orders = await getAllOrder(null, dataUser.id, searchQuery, limitQuery, currentQuery, warehouseQuery, date!)
            setOrderList(orders.orderList)
            setTotalPages(orders.totalPages)
            setCurrectPage(orders.currentPage)
        } else {
            const orders = await getAllOrder(dataAdmin.id, null, searchQuery, limitQuery, currentQuery, warehouseQuery, date!)
            setOrderList(orders.orderList)
            setTotalPages(orders.totalPages)
            setCurrectPage(orders.currentPage)
        }
    }, [searchQuery, limitQuery, currentQuery, warehouseQuery, date])

    useEffect(() => {
        getOrder()
    }, [encodedsSearchQuery, limitQuery, currentQuery, date, encodedsWarehouseQuery, getOrder])
    return (
        <>
        <div>
            <SearchOrder data={searchQuery || ''} date={date} setDate={setDate} />
            <OrderTable orderList={orderList} setOrderList={setOrderList} currentPage={currentQuery} date={date!}/>
            <PaginationOrder page={currentPage} totalPages={totalPages} />
        </div>
        </>
    )
}
