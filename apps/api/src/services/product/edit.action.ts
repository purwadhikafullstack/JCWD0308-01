import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClient, ProductSize } from "@prisma/client";

const prisma = new PrismaClient()

export async function editProduct(req: Request, res: Response) {
    const { slug } = req.params;
    const { name, isVisible, description, price, thumbnailURL, additionalURL, additionalDelete, colorVariantEdit, colorVariantNew, colorVariantDelete, categoryData } = req.body;
    const symbolRegex = /[^a-zA-Z0-9\s-]/;
    if (name.length > 30 || name.length < 2 || name.trim().length === 0 || symbolRegex.test(name)) throw "Invalid name input."
    if (description.length > 500 || description.length < 15 || description.trim().length === 0) throw "Invalid description input."
    if (isNaN(price) || price < 1000) throw "Invalid price input."
    if (!categoryData) throw "Invalid category input."
    const sizeArray = ['S', 'M', 'L', 'XL']
    const wareHouseList = await prisma.warehouse.findMany()
    const productCategory = await prisma.productCategory.findFirst({
        where: {
            gender: categoryData.gender.toUpperCase(),
            type: categoryData.type.toUpperCase(),
            category: categoryData.category
        }
    });
    await prisma.$transaction(async (tx) => {
        
        const product = await tx.product.update({
            data: {
                name,
                description,
                price,
                isActive: isVisible,
                slug: name.toLowerCase().replaceAll(" ", "-"),
                categoryID: productCategory!.id,
                updatedAt: new Date()
            },
            where: {
                slug
            }
        });

        if (thumbnailURL) {
            await tx.product.update({
                data: {
                    thumbnailURL
                },
                where: {
                    slug
                }
            });
        }

        if (additionalURL.length > 0) {
            for (let i = 0; i < additionalURL.length; i++) {
                await tx.productImage.create({
                    data: {
                        id: uuidv4(),
                        image: additionalURL[i],
                        productID: product.id
                    }
                });
            }
        }

        if (additionalDelete.length > 0) {
            for (let i = 0; i < additionalDelete.length; i++) {
                await tx.productImage.delete({
                    where: {
                        id: additionalDelete[i]
                    }
                });
            }
        }

        if (colorVariantEdit.length > 0) {
            for (let i = 0; i < colorVariantEdit.length; i++) {
                await tx.productVariant.update({
                    where: {
                        id: colorVariantEdit[i].id
                    },
                    data: {
                        color: colorVariantEdit[i].name,
                        HEX: colorVariantEdit[i].code,
                        image: colorVariantEdit[i].variantImageURL
                    }
                });
            }
        }

        if (colorVariantNew.length > 0) {
            for (let i=0; i<colorVariantNew.length; i++) {
                const variant = await tx.productVariant.create({
                    data: {
                        id: uuidv4(),
                        productID: product.id,
                        color: colorVariantNew[i].name,
                        HEX: colorVariantNew[i].code,
                        image: colorVariantNew[i].variantImageURL  
                    }
                })
                for (let k = 0; k<wareHouseList.length; k++) {
                    if (product.oneSize) {
                        await tx.warehouseProduct.create({
                            data: {
                                id: uuidv4(),
                                warehouseID: wareHouseList[k].id,
                                productVariantID: variant.id,
                                size: 'ONESIZE',
                                stock: 0
                            }
                        })
                    } else {
                        for (let s = 0; s<sizeArray.length; s++) {
                            await tx.warehouseProduct.create({
                                data: {
                                    id: uuidv4(),
                                    warehouseID: wareHouseList[k].id,
                                    productVariantID: variant.id,
                                    size: sizeArray[s] as ProductSize,
                                    stock: 0
                                }
                            })
                        }
                    }
                }
            }
        }

        if (colorVariantDelete.length > 0) {
            for (let i = 0; i < colorVariantDelete.length; i++) {
                for (let k = 0; k<wareHouseList.length; k++) {
                    const currentStock = await tx.warehouseProduct.findMany({
                        where: {
                            warehouseID: wareHouseList[k].id,
                            productVariantID: colorVariantDelete[i]
                        }
                    })   
                    if (currentStock.length > 0) {
                        const stockLog = await tx.stockMutation.create({
                            data: {
                                id: uuidv4(),
                                warehouseID: wareHouseList[k].id,
                                type: 'DELETE',
                            }
                        })
                        for (let c = 0; c<currentStock.length; c++) {
                            await tx.stockMutationItem.create({
                                data: {
                                    id: uuidv4(),
                                    quantity: currentStock[c].stock,
                                    stockMutationID: stockLog.id,
                                    warehouseProductID: currentStock[c].id
                                }
                            })
                            await tx.warehouseProduct.updateMany({
                                where: {
                                    productVariantID: colorVariantDelete[i],
                                    warehouseID: wareHouseList[k].id
                                },
                                data: {
                                    isDelete: true,
                                    stock: 0
                                }
                            })
                        }
                    }
                    await tx.productVariant.update({
                        where: {
                            id: colorVariantDelete[i]
                        },
                        data: {
                            isDeleted: true
                        }
                    })
                }
                
                     
            }
        }
        return res.status(200).send({
            status: 'ok',
            message: 'product updated'
        });
    });
}
