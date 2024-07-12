import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, ProductSize } from "@prisma/client";
import { serverResponse } from '@/helpers/apiResponse';

const prisma = new PrismaClient()

export async function createProduct(req: Request, res: Response) {
    await prisma.$transaction(async (tx)=> {
        
        const {name, description, price, categoryData, oneSize, colorVariant, thumbnailURL, additionalURL } = req.body
        const sizeArray = ['S', 'M', 'L', 'XL']
        const symbolRegex = /[^a-zA-Z0-9\s-]/;
        if (name.length > 30 || name.length < 2 || name.trim().length === 0 || symbolRegex.test(name)) throw "Invalid name input."
        if (description.length > 500 || description.length < 15 || description.trim().length === 0) throw "Invalid description input."
        if (isNaN(price) || price < 1000) throw "Invalid price input."
        if (!categoryData) throw "Invalid category input."
        if (!colorVariant) throw "Invalid color variant input."
        if (!thumbnailURL) throw "Invalid thumbnail input."
        
        const wareHouseList = await tx.warehouse.findMany()
        
        if (!wareHouseList) throw "No warehouse found, please create warehouse."
        const validateName = await tx.product.findFirst({where: { name }})
        if (validateName) throw "product name already exists"
        const productCategory = await tx.productCategory.findFirst({
            where: {
                gender: categoryData.gender.toUpperCase(),
                type: categoryData.type.toUpperCase(),
                category: categoryData.category
            }
        })
        const newProduct = await tx.product.create({
            data: { id: uuidv4(), name, slug: name.toLowerCase().replaceAll(" ", "-"), description, price, categoryID: productCategory!.id, oneSize: oneSize, thumbnailURL }
        })
        for (let i=0; i<additionalURL.length; i++) {
            await tx.productImage.create({ data: { id: uuidv4(), productID: newProduct.id, image: additionalURL[i] } })
        }
        for (let i=0; i<colorVariant.length; i++) {
            const variant = await tx.productVariant.create({ 
                data: { id: uuidv4(), productID: newProduct.id, color: colorVariant[i].name, 
                HEX: colorVariant[i].code, image: colorVariant[i].variantImageURL }
            })

            for (let w=0; w<wareHouseList.length; w++) {
                if (newProduct.oneSize) {
                    await tx.warehouseProduct.create({
                        data: {
                            warehouseID: wareHouseList[w].id,   
                            productVariantID: variant.id,
                            size: 'ONESIZE',              
                            stock: 0       
                        }
                    })
                } else {
                    for (let z=0; z<sizeArray.length; z++) {
                        await tx.warehouseProduct.create({
                            data: {
                                warehouseID: wareHouseList[w].id,   
                                productVariantID: variant.id,
                                size: sizeArray[z] as ProductSize,              
                                stock: 0       
                            }
                        })
                        console.log(wareHouseList[w].warehouseName);
                        
                    }
                }
            }
            
        }
        return serverResponse(res, 200, 'ok', 'Product successfully created.')
    })
}

