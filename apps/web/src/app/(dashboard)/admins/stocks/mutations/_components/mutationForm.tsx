import { Label } from '@/components/ui/label'
import React, { useEffect, useState } from 'react'
import { Selector } from '../../../../../../components/selector'
import { IProductVariant, IWarehouse } from '@/constants'
import { createMutationRequest, getWarehouseFiltered, getProductName, getProductSlug, getVariantStock } from '@/app/action'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PiArrowRightBold } from 'react-icons/pi'
import { CancelAlert } from '@/components/cancelAlertTemplate'
import { SubmitAlert } from '@/components/submitAlertTemplate'

interface IName {
    slug: string
    name: string
}

interface IMutationForm {
    selectedWH:string
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const MutationForm = ({selectedWH, setOpen}:IMutationForm) => {
    const [nameArr, setNameArr] = useState<IName[]>([])
    const [selectedProd, setSelectedProd] = useState('')
    const [size, setSize] = useState('')
    const [variant, setVariant] = useState('')
    const [variantArr, setVariantArr] = useState<IProductVariant[]>([])
    const [sizeArr, setSizeArr] = useState<string[]>([])
    const [qty, setQty] = useState(0)
    const [currentStock, setCurrentStock] = useState(0)
    const [targetCurrentStock, setTargetCurrentStock] = useState(0)
    const [warehouseList, setWarehouseList] = useState<IWarehouse[]>([])
    const [targetWH, setTargetWH] = useState('')

    const handleSubmit = async() =>  {
        if (!targetWH || !qty || !size || !variant) {
            toast.warning('Failed to submit, data is incomplete.')
        } else {
            const dataSet = {selectedWH, targetWH, variant, size, qty}
            const res = await createMutationRequest(dataSet)
            if (res.status == 'ok') {
                toast.success('Stock mutation request successfully created.')
                setOpen(false)
            } else {
                toast.error('Stock mutation request failed.')
            }
        }
    }

    useEffect(() => {
        const getData = async () => {
            const res = await getProductName('')
            setVariant('')
            const war = await getWarehouseFiltered(selectedWH)    
            if (res.status == 'ok') {
                setNameArr(res.data)
                setSelectedProd(res.data[0].name)
                setWarehouseList(war.data)
            }
        }
        getData()
    }, [selectedWH])   
    
    useEffect(() => {
        if (selectedProd) {
            const getData = async() => {
                const slug = selectedProd.toLocaleLowerCase().replaceAll(' ', '-')
                const res = await getProductSlug(slug, selectedWH, size)
                if (res.status == 'ok') {
                    setVariantArr(res.productList.variants)
                    if (!res.productList.oneSize) {
                        setSizeArr(['S', 'M', 'L', 'XL'])
                    } else {
                        setSizeArr(['ONESIZE'])
                    }
                }
            }
            getData()
        } 
    }, [size, selectedProd, selectedWH])

    useEffect(() => {
        setVariant('')
        setSize('')
        setQty(0)
    }, [selectedProd, targetWH])    

    useEffect(() => {
        if (variant && size) {
            const getData= async() => {
                const res = await getVariantStock(variant, selectedWH, size)
                const resTarget = await getVariantStock(variant, targetWH, size)
                if (res.status == 'ok' && resTarget.status == 'ok') {
                    setCurrentStock(res.data.stock)
                    setTargetCurrentStock(resTarget.data.stock)
                }
            }
            getData()
        }
    }, [variant, selectedWH, size, targetWH])

  return (
    <div className='mt-7'>
        <Label htmlFor='products' className='text-lg'>Target Warehouse</Label>
        <Selector 
        label='warehouse'
        setState={setTargetWH}
        state={warehouseList.map(item => item.warehouseName)}/>

        <Separator className='my-7' />

        <Label htmlFor='products' className='text-lg'>Choose Product</Label>
        <Selector 
        disabled={targetWH ? false : true}
        label='product'
        setState={setSelectedProd}
        defValue={selectedProd}
        state={nameArr}/>

        <div className='flex gap-2 mt-7'>
            <div className='flex-1'>
                <Label htmlFor='products'>Variants</Label>
                <Select defaultValue={variant} onValueChange={(value) => { if (variantArr.length > 0) setVariant(value)}} disabled={targetWH && selectedProd ? false : true}>
                <SelectTrigger className={`focus:ring-transparent  focus-visible:border-[1px] focus-visible:border-black max-sm:text-xs text-sm truncate`}>
                    <SelectValue placeholder={'Variants'}/>
                </SelectTrigger>
                <SelectContent>
                    {variantArr.map((item:any, index:number) => {
                        return (
                        <SelectItem key={index} 
                        value={item.id} 
                        >
                        <div className="flex items-center gap-2">
                            <p>{item.color}</p>
                        </div>
                        </SelectItem>
                        )
                    })}
                </SelectContent>
                </Select>
            </div>

            <div className='flex-1'>
                <Label htmlFor='products'>Size</Label>
                <Selector
                width=""
                label="Size"
                disabled={!selectedProd || !targetWH || !variant? true : false}
                state={sizeArr}
                setState={setSize}/>
            </div>

            <div className='flex-1'>
                <Label htmlFor='products'>Quantity</Label>
                <Input
                    disabled={variant && size && targetWH ? false : true}
                    type='text'
                    inputMode='decimal'
                    placeholder="0"
                    value={qty ?? ''}
                    className="focus-visible:ring-black/0 focus-visible:border-black/60 text-center"
                    onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || !isNaN(Number(value))) {
                        if (isNaN(Number(value)) || Number(value) > 1000) {
                        toast.warning("Maximum stock change limit is 1.000.");
                        } else if (targetCurrentStock < Number(value)) {
                            toast.warning('Insufficient stock at target warehouse.')
                        } else {
                        setQty(Number(value))
                        }
                    }
                    }}
                />  
            </div>
        </div>
        <div className='flex gap-2 mt-7 justify-center bg-secondary py-2 rounded-sm'>
            <div className='w-36 flex flex-col items-center justify-center'>
                <p className='text-xs font-bold'>{targetWH} Stock</p>
                <p className='text-xs'>{targetCurrentStock}</p>
            </div>
            <PiArrowRightBold className='self-center'/>
            <div className='w-36 flex flex-col items-center justify-center'>
            <p className='text-xs font-bold'>Your Stock</p>
                <div className='flex items-center gap-2'>
                     <p className='text-xs'>{currentStock}</p>
                    <PiArrowRightBold className='text-xs text-gray-500'/>
                    <p className='text-xs'>{currentStock + (size == 'All Sizes'? qty * 4 : qty)}</p>
                </div>
            </div>
        </div>
        <div className="flex gap-2 justify-end mt-7">
            <CancelAlert setOpen={setOpen} title={'Close mutation form?'} cta={'Cancel'} message={'All input will be lost.'}/>
            <SubmitAlert action={handleSubmit} title={'Request product mutation?'} cta={'Request'} message={'Make sure all data are correct.'}/>
      </div>
    </div>
  )
}