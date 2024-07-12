"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Separator } from "@/components/ui/separator"
import { Form } from "@/components/ui/form"
import { NameField } from "./form/nameField"
import { DescriptionField } from "./form/descriptionField"
import { SizingField } from "./form/sizingField"
import { useEffect, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CategoryField } from "./form/categoryField"
import { editProduct, getCategory, getProductSlug} from "@/app/action"
import { CancelAlert } from "../../../../../../components/cancelAlertTemplate"
import { ImageField } from "./form/imageField"
import useStorage from "@/hooks/useStorage"
import { PriceField } from "./form/priceField"
import { toast } from "sonner"
import { EditColorField } from "./form/edit/editColorField"
import { IEditAdditional, IEditColor } from "@/constants"
import { SubmitAlert } from "../../../../../../components/submitAlertTemplate"
import { checkInvalidEdit } from "@/lib/productValidation"
import { Visibility } from "./form/edit/editVisibility"

const formSchema = z.object({})

interface ICategory {
  id?: string
  category?: string
}

export function EditProductForm({setOpen, slug}:{slug:string, setOpen:React.Dispatch<React.SetStateAction<boolean>>}) {
  const [categoryList, setCategoryList] = useState<ICategory[]>([])
  const [name, setName] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [gender, setGender] = useState('')
  const [type, setType] = useState('')
  const [category, setCategory] = useState('')
  const [color, setColor] = useState<IEditColor[]>([])
  const [currentThumbnail, setCurrentThumbnail] = useState('')
  const [thumbnail, setThumbnail] = useState<File | undefined>(undefined)
  const [currentAdditional, setCurrentAdditional] = useState<IEditAdditional[]>([]);
  const [additionalImage, setAdditionalImage] = useState<File[]>([]);
  const [invalidCategory, setInvalidCategory] = useState(false)
  const [invalidMainImage, setInvalidMainImage] = useState(false)
  const [invalidColor, setInvalidColor] = useState(false)
  const [nameErrorMessage, setNameErrorMessage] = useState('')
  const [descErrorMessage, setDescErrorMessage] = useState('')
  const [priceErrorMessage, setPriceErrorMessage] = useState('')
  const { uploadFile, progress, removeImageFromStorage } = useStorage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {name: '', description:  '', price: 0,onesize: false},
  }) 

  const getCategoryData = async(gender:string, type:string) => {
      if (gender && type) {
        const data = await getCategory(gender, type)
        setCategoryList(data.category)
      }
  }

  const getProductData = async(slug:string) => {
    const data = await getProductSlug(slug, "", "")
    setName(data.productList.name)
    setDescription(data.productList.description)
    setPrice(data.productList.price)
    setIsVisible(data.productList.isActive)
    setGender(data.productList.category.gender.charAt(0) + data.productList.category.gender.slice(1).toLowerCase())
    setType(data.productList.category.type.charAt(0) + data.productList.category.type.slice(1).toLowerCase())
    setCategory(data.productList.category.category)
    // setIsOneSize(data.productList.oneSize)
    setCurrentThumbnail(data.productList.thumbnailURL)
    const getAdditional = () => {
      let additional = []
      for (let i = 0; i < data.productList.images.length; i++) {
        const additionals = {...data.productList.images[i], isDeleted: false, isNew: false}
        additional.push(additionals)
      }
      return additional
    }
    setCurrentAdditional(getAdditional)
    const getColor = () => {
      let color = []
      for (let i = 0; i < data.productList.variants.length; i++) {
        const colorData = {
          id: data.productList.variants[i].id,
          code: data.productList.variants[i].HEX,
          name: data.productList.variants[i].color,
          imageURL: data.productList.variants[i].image,
          isDeleted: false,
          isEdited: false,
          isNew: false,
        }
        color.push(colorData)
      }
      return color
    }
    setColor(getColor);
  }

  useEffect(() => {
      getCategoryData(gender, type)
    }, [gender, type])  
  

  useEffect(() => {
    getProductData(slug)
  }, [slug])

  async function onSubmit() {
    const isInvalid = checkInvalidEdit(category, color,name,description,price, setInvalidCategory, setInvalidColor, setInvalidMainImage, setNameErrorMessage, setDescErrorMessage, setPriceErrorMessage)
    if (isInvalid) {
      toast.error("Product data is incomplete.")
    } else {
        let thumbnailURL = ''
        if (thumbnail) {thumbnailURL = await uploadFile(thumbnail!, 'thumbnail')}
        // if (thumbnail) {await removeImageFromStorage(currentThumbnail, 'thumbnail')}
        let additionalURL = []
        let additionalDelete = []
        let colorVariantEdit = []
        let colorVariantNew = []
        let colorVariantDelete = []
        for (let i = 0; i<color.length; i++) {
          if (color[i].isEdited && color[i].image) {
            const variantImageURL = await uploadFile(color[i].image!, 'variant')
            const data = {id:color[i].id , code: color[i].code, name: color[i].name, variantImageURL: variantImageURL}
            colorVariantEdit.push(data)
          } else if (color[i].isEdited) {
            const data = {id:color[i].id, code: color[i].code, name: color[i].name, variantImageURL: color[i].imageURL}
            colorVariantEdit.push(data)
          } else if (color[i].isNew) {
            const variantImageURL = await uploadFile(color[i].image!)
            const data = {code: color[i].code, name: color[i].name, variantImageURL: variantImageURL}
            colorVariantNew.push(data)
          } else if (color[i].isDeleted) {
            // await removeImageFromStorage(color[i].imageURL!, 'variant')
            colorVariantDelete.push(color[i].id)
          }
        }
        if (additionalImage.length > 0) {
          for (let i = 0; i<additionalImage.length; i++) {
            const AdditionalImageURL = await uploadFile(additionalImage[i], 'additional')
            additionalURL.push(AdditionalImageURL)
          }
        }
        for (let i = 0; i<currentAdditional.length; i++) {
          if (currentAdditional[i].isDeleted) {
            // await removeImageFromStorage(currentAdditional[i].image!, 'additional')
            additionalDelete.push(currentAdditional[i].id)
          }
        }       
        const data = {name, isVisible, description, price, thumbnailURL, additionalURL, additionalDelete, colorVariantEdit, colorVariantNew, colorVariantDelete, categoryData:{gender, type, category}}        
        const res = await editProduct(data, slug)
        if (res.status == 'ok') {
          setOpen(false)
          toast.success("Product successfully updated.")
        } else if (res.status =='error') {
          toast.error("Failed to update product.")
        }
      }
    }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full pt-5 ">
        <div className="flex max-md:flex-wrap w-full gap-5">
          <ScrollArea className="h-[500px] md:w-[200px] bg-gray-100 rounded-sm max-md:hidden p-4">
            <ImageField 
              currentAdditional={currentAdditional}
              currentThumbnail={currentThumbnail}
              setCurrentAdditional={setCurrentAdditional}
              thumbnail={thumbnail}
              setThumbnail={setThumbnail}
              invalidMainImage={invalidMainImage}
              setInvalidMainImage={setInvalidMainImage}
              additionalImage={additionalImage}
              setAdditionalImage={setAdditionalImage}
            />
          </ScrollArea>
          <ScrollArea className="flex max-md:h-[65vh] md:h-[500px] grow">
              <Visibility isVisible={isVisible} setIsVisible={setIsVisible}/>
            <Separator className="my-7"/>
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
              <EditColorField
                setColor={setColor}
                color={color}
                invalidColor={invalidColor}
              />
            <Separator className="my-7 md:hidden"/>
            <div className="min-h-[250px] md:w-[200px] bg-gray-100 rounded-sm md:hidden p-4">
              <ImageField 
                currentAdditional={currentAdditional}
                currentThumbnail={currentThumbnail}
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
            <CancelAlert setOpen={setOpen} title={'Close product editor?'} cta={'Cancel'} message={'All changes will be lost.'}/>
            <SubmitAlert action={onSubmit} title={'Update product?'} cta={'Update'} message={'Make sure all data are correct.'}/>
        </div>
      </form>
    </Form>
  )
}
