"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { NameField } from "./form/nameField"
import { DescriptionField } from "./form/descriptionField"
import { SizingField } from "./form/sizingField"
import { ColorField } from "./form/colorField"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CategoryField } from "./form/categoryField"
import { createProduct, getCategory } from "@/app/action"
import { CancelAlert } from "../../../../../../components/cancelAlertTemplate"
import { ImageField } from "./form/imageField"
import useStorage from "@/hooks/useStorage"
import { PriceField } from "./form/priceField"
import { toast } from "sonner"
import { SubmitAlert } from "../../../../../../components/submitAlertTemplate"
import { checkInvalidCreate } from "@/lib/productValidation"

const formSchema = z.object({})

interface ICategory {
  id?: string
  category?: string
}

interface IColor {
  code: string
  name: string
  image: File
}

export function CreateProductForm({setOpen}:{setOpen:React.Dispatch<React.SetStateAction<boolean>>}) {
  const [categoryList, setCategoryList] = useState<ICategory[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [color, setColor] = useState<IColor[]>([])
  const [gender, setGender] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [isOneSize, setIsOneSize] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | undefined>(undefined);
  const [additionalImage, setAdditionalImage] = useState<File[]>([]);
  const [invalidCategory, setInvalidCategory] = useState(false)
  const [invalidMainImage, setInvalidMainImage] = useState(false)
  const [invalidColor, setInvalidColor] = useState(false)
  const [nameErrorMessage, setNameErrorMessage] = useState('')
  const [descErrorMessage, setDescErrorMessage] = useState('')
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const { uploadFile, progress } = useStorage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {name: "", description: "", price: 0,onesize: false},
  })

  const onSubmit =  async() => {
      try {
        const isInvalid = checkInvalidCreate(
          category,
          color,
          thumbnail,
          name,
          description,
          price,
          setInvalidCategory,
          setInvalidColor,
          setInvalidMainImage,
          setNameErrorMessage,
          setDescErrorMessage,
          setPriceErrorMessage)
        if (isInvalid) {
          toast.error("Product data is incomplete.")
        } else {   
            const loadingToast = toast.loading('Creating products, please wait.')
            loadingToast
            let thumbnailURL = await uploadFile(thumbnail!, 'thumbnail')
            let additionalURL = []
            let colorVariant = []
            if (additionalImage.length > 0) {
              for (let i = 0; i<additionalImage.length; i++) {
                const AdditionalImageURL = await uploadFile(additionalImage[i], 'additional')
                additionalURL.push(AdditionalImageURL)
              }
            }            
            for (let i = 0; i<color.length; i++) {
              const variantImageURL = await uploadFile(color[i].image, 'variant')
              let data = {code: color[i].code, name: color[i].name, variantImageURL: variantImageURL}
              colorVariant.push(data)
            }
            const data = {name, description, oneSize: isOneSize, price, colorVariant, additionalURL, thumbnailURL, categoryData:{gender, type, category}}
            const res = await createProduct(data)
            if (res.status == 'ok') {
              toast.dismiss(loadingToast)
              setOpen(false)
              toast.success("product successfully created")
            } else if (res.status =='error') {
                toast.dismiss(loadingToast)
                typeof(res.message) == 'string' ? toast.error(res.message) : toast.error('Failed to create product.')
            }
          }
      } catch (error) {
        console.log(error);
      }
    }


  const getCategoryData = async(gender:string, type:string) => {
      if (gender && type) {
        const data = await getCategory(gender, type)
        setCategoryList(data.category)
      }
  }

  useEffect(() => {
      getCategoryData(gender, type)
    }, [gender, type])  

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full pt-5 ">
        <div className="flex max-md:flex-wrap w-full gap-5">
          <ScrollArea className="h-[500px] md:w-[200px] bg-gray-100 rounded-sm max-md:hidden p-4">
            <ImageField 
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              invalidMainImage={invalidMainImage}
              setInvalidMainImage={setInvalidMainImage}
              additionalImage={additionalImage}
              setAdditionalImage={setAdditionalImage}
            />
          </ScrollArea>
          <ScrollArea className="flex max-md:h-[65vh] md:h-[500px] grow">
              <NameField name={name} setName={setName} setNameErrorMessage={setNameErrorMessage} nameErrorMessage={nameErrorMessage}/>
            <Separator className="my-7"/>
              <DescriptionField description={description} setDescription={setDescription} descErrorMessage={descErrorMessage} setDescErrorMessage={setDescErrorMessage}/>
            <Separator className="my-7"/>
              <PriceField price={price} setPrice={setPrice} priceErrorMessage={priceErrorMessage} setPriceErrorMessage={setPriceErrorMessage}/>
            <Separator className="my-7"/>
              <CategoryField
                type={type}
                setGender={setGender}
                setType={setType}
                setCategory={setCategory}
                categoryList={categoryList}
                gender={gender}
                invalidCategory={invalidCategory}
                category={category}
              />
            <Separator className="my-7"/>
              <SizingField 
                isOneSize={isOneSize}
                setIsOneSize={setIsOneSize}
              />
            <Separator className="my-7"/>
              <ColorField
                form={form}
                setColor={setColor}
                color={color}
                invalidColor={invalidColor}
              />
            <Separator className="my-7 md:hidden"/>
            <div className="min-h-[250px] md:w-[200px] bg-gray-100 rounded-sm md:hidden p-4">
              <ImageField 
                thumbnail={thumbnail}
                setThumbnail={setThumbnail}
                invalidMainImage={invalidMainImage}
                setInvalidMainImage={setInvalidMainImage}
                additionalImage={additionalImage}
                setAdditionalImage={setAdditionalImage}
              />
            </div>
          </ScrollArea>
        </div>
        <div className="flex gap-2 justify-end">
          <CancelAlert setOpen={setOpen} title={'Close product creator?'} cta={'Cancel'} message={'All data will be lost.'}/>
          <SubmitAlert title={'Create product?'} cta={'Create'} message={'Make sure all data are correct.'} action={onSubmit}/>
        </div>
      </form>
    </Form>
  )
}
