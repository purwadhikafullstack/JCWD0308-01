import { MutationStatus, MutationTypes, PrismaClient, ProductSize } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient()

async function getWarehouseProductId(warehouseID: string, productVariantID: string, size: string) {
    const warehouseProduct = await prisma.warehouseProduct.findFirst({
        where: {
            warehouseID,
            productVariantID,
            size: size as ProductSize
        },
        select: {
            id: true
        }
    });

    return warehouseProduct ? warehouseProduct.id : null;
}

export async function createMutation(warehouseID: string, associatedWarehouseID: string, type: string, status: string) {
    const stockMutation = await prisma.stockMutation.create({
        data: {
            id: uuidv4(),
            warehouseID,
            associatedWarehouseID,
            type: type as MutationTypes,
            status: status as MutationStatus,
        }
    });
    return stockMutation.id!
}

export async function createMutationTransaction(warehouseID: string, type: string, status: string) {
    const stockMutation = await prisma.stockMutation.create({
        data: {
            id: uuidv4(),
            warehouseID,
            type: type as MutationTypes,
            status: status as MutationStatus,
        }
    });
    return stockMutation
}

export async function createMutationItem(stockMutationID: string, quantity: number, warehouseId: string, productVariantId: string, size: string) {
    const warehouse = await getWarehouseProductId(warehouseId!, productVariantId!, size!)
    const item = await prisma.stockMutationItem.create({
        data: {
            id: uuidv4(),
            quantity,
            warehouseProductID: warehouse!,
            stockMutationID
        }
    })
    return item
}

export async function reduceStockWarehouse( warehouseID: string, productVariantID: string, size: string, quantity: number) {
    await prisma.warehouseProduct.updateMany({
        where: {
            warehouseID,
            productVariantID,
            size: size as ProductSize
        },
        data: {
            stock: {
                decrement: quantity
            }
        }
    })
}

export async function addStockWarehouse( warehouseID: string, productVariantID: string, size: string, quantity: number) {
    await prisma.warehouseProduct.updateMany({
        where: {
            warehouseID,
            productVariantID,
            size: size as ProductSize
        },
        data: {
            stock: {
                increment: quantity
            }
        }
    })
}

export async function handleWarehouseDelete( warehouseID:string) {
        await prisma.$transaction(async (tx) => {
            const whProducts = await tx.warehouseProduct.findMany({
                where: {
                    warehouseID
                }
            })
            
            const mutation = await tx.stockMutation.create({
                data: {
                    type: "DELETE",
                    warehouseID
                }
            })

            for (let i = 0; i<whProducts.length; i++) {
                await tx.stockMutationItem.create({
                    data: {
                        id: uuidv4(),
                        quantity: whProducts[i].stock,
                        stockMutationID: mutation.id,
                        warehouseProductID: whProducts[i].id                
                    }
                })
            }

            await tx.warehouseProduct.updateMany({
                where: {
                    warehouseID
                },
                data: {
                    stock: 0
                }
            })
            return 'stock emptied'
        })
}

export async function handleNewWarehouseStock(warehouseID:string) {
    const sizeArray = ['S', 'M', 'L', 'XL']
    const productList = await prisma.product.findMany()

    for (let i=0; i<productList.length; i++) {
        const variants = await prisma.productVariant.findMany({
            where: {
                productID: productList[i].id
            }
        })

        for (let v=0; v<variants.length; v++) {
            if (productList[i].oneSize) {
                await prisma.warehouseProduct.create({
                    data: {
                        warehouseID: warehouseID,   
                        productVariantID: variants[v].id,
                        size: 'ONESIZE',              
                        stock: 0       
                    }
                })
            } else {
                for (let z=0; z<sizeArray.length; z++) {
                    await prisma.warehouseProduct.create({
                        data: {
                            warehouseID: warehouseID,   
                            productVariantID: variants[v].id,
                            size: sizeArray[z] as ProductSize,              
                            stock: 0       
                        }
                    })
                }
            }
        }
    }
}