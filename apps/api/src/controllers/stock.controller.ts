import { Request, Response } from "express";
import prisma from "@/prisma";
import {v4 as uuidv4} from 'uuid'
import { serverResponse } from "@/helpers/apiResponse";



export class StockController {
    async createStock(req: Request, res:Response) {
        enum ProductSize {S = 'S', M = 'M', L = 'L', XL = 'XL'}
        try {
            const sizeArray: ProductSize[] = [ProductSize.S, ProductSize.M, ProductSize.L, ProductSize.XL];
            const {warehouseName, type, variant} =req.body
            if (!warehouseName || !type || !variant) throw "Invalid stock data input."
            if (["RESTOCK", "TRANSFER", "RESTOCK", "REMOVE", "TRANSACTION", "INBOUND", "DELETE"].includes(type) == false) throw "Invalid stock data input."
            const mutationType = type.toUpperCase()            
            await prisma.$transaction(async (tx) => {
                if (warehouseName === "All Warehouses" || warehouseName==='') {
                    const wareHouseList = await tx.warehouse.findMany()
                    for (let w = 0; w < wareHouseList.length; w++) {
                        const stockMutation = await tx.stockMutation.create({
                            data: {
                                id: uuidv4(),
                                warehouseID: wareHouseList[w].id,
                                type: mutationType
                            }
                        })
                        for (let i = 0; i<variant.length; i++) {
                            if (variant[i].size === "All Sizes") {
                                for (let k = 0; k<sizeArray.length; k++) {
                                    const currentStock = await tx.warehouseProduct.findFirst({
                                        where: {
                                            productVariantID: variant[i].id,
                                            size: sizeArray[k],
                                            warehouseID: stockMutation.warehouseID
                                        }, include: {
                                            productVariant: {
                                                include: {
                                                    product: {
                                                        select:{
                                                            name:true
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    })
                                    if (!currentStock) throw "Product variant not found."
                                    if (currentStock!.stock < variant[i].qty && type == "REMOVE") throw `Failed to remove, insufficient stock at ${wareHouseList[w].warehouseName} (${currentStock!.stock}, ${currentStock?.productVariant.color}, ${sizeArray[k]})` 
                                    const newStockLog = await tx.stockMutationItem.create({
                                        data: {
                                            id: uuidv4(),
                                            quantity: variant[i].qty,
                                            stockMutationID: stockMutation.id,
                                            warehouseProductID: currentStock!.id
                                        }
                                    })
                                    await tx.warehouseProduct.update({
                                        where: {
                                            id: currentStock?.id,
                                        }, 
                                        data:{
                                            stock: Number(mutationType == "RESTOCK" || mutationType === "INBOUND"
                                                ? newStockLog.quantity + currentStock!.stock 
                                                : currentStock!.stock > newStockLog.quantity
                                                ? currentStock!.stock - newStockLog.quantity
                                                : 0
                                            ),
                                            updatedAt: new Date()
                                        }
                                    })
                                }
                            } else {
                                const currentStock = await tx.warehouseProduct.findFirst({
                                    where: {
                                        productVariantID: variant[i].id,
                                        size: variant[i].size.toUpperCase(),
                                        warehouseID: stockMutation.warehouseID
                                    }, include: {
                                        productVariant: {
                                            include: {
                                                product: {
                                                    select:{
                                                        name:true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }) 
                                if (!currentStock) throw "Product variant not found."
                                if (currentStock!.stock < variant[i].qty && type == "REMOVE") throw `Failed to remove, insufficient stock at  ${wareHouseList[w].warehouseName} (${currentStock!.stock}, ${currentStock?.productVariant.color}, ${variant[i].size.toUpperCase()}`       
                                const newStockLog = await tx.stockMutationItem.create({
                                    data: {
                                        id: uuidv4(),
                                        quantity: variant[i].qty,
                                        stockMutationID: stockMutation.id,
                                        warehouseProductID: currentStock!.id
                                    }
                                })                                                          
                                await tx.warehouseProduct.update({
                                    where: {
                                        id: currentStock?.id,
                                    }, 
                                    data: {
                                        stock: Number(mutationType == "RESTOCK" || mutationType === "INBOUND"
                                            ? newStockLog.quantity + currentStock!.stock 
                                            : currentStock!.stock > newStockLog.quantity
                                            ? currentStock!.stock - newStockLog.quantity
                                            : 0
                                        )
                                    }
                                })                              
                            }
                        }
                    }
                } else {
                    const wareHouseList = await tx.warehouse.findFirst({
                        where: {
                            warehouseName
                        }
                    })
                    if (!wareHouseList) throw "Invalid warehouse."
                    if (!wareHouseList) throw "Warehouse not found."                    
                    const stockMutation = await tx.stockMutation.create({
                        data: {
                            id: uuidv4(),
                            warehouseID: wareHouseList!.id,
                            type: mutationType
                        }
                    })
                    for (let i = 0; i<variant.length; i++) {
                        if (variant[i].size === "All Sizes") {
                            for (let k = 0; k<sizeArray.length; k++) {
                                const currentStock = await tx.warehouseProduct.findFirst({
                                    where: {
                                        productVariantID: variant[i].id,
                                        size: sizeArray[k],
                                        warehouseID: stockMutation.warehouseID
                                    }, include: {
                                        productVariant: {
                                            include: {
                                                product: {
                                                    select:{
                                                        name:true
                                                    }
                                                }
                                            }
                                        }
                                    }
                                })
                                if (!currentStock) throw "Product variant not found."
                                if (currentStock!.stock < variant[i].qty && type == "REMOVE") throw `Failed to remove, insufficient stock at ${wareHouseList!.warehouseName} (${currentStock!.stock}, ${currentStock?.productVariant.color}, ${sizeArray[k]})` 
                                const newStockLog = await tx.stockMutationItem.create({
                                    data: {
                                        id: uuidv4(),
                                        quantity: variant[i].qty,
                                        stockMutationID: stockMutation.id,
                                        warehouseProductID: currentStock!.id
                                    }
                                })
                                await tx.warehouseProduct.update({
                                    where: {
                                        id: currentStock?.id,
                                    }, 
                                    data:{
                                        stock: Number(mutationType == "RESTOCK" || mutationType === "INBOUND"
                                            ? newStockLog.quantity + currentStock!.stock 
                                            : currentStock!.stock > newStockLog.quantity
                                            ? currentStock!.stock - newStockLog.quantity
                                            : 0
                                        ),
                                        updatedAt: new Date()
                                    }
                                })
                            }
                        } else {
                            const currentStock = await tx.warehouseProduct.findFirst({
                                where: {
                                    productVariantID: variant[i].id,
                                    size: variant[i].size.toUpperCase(),
                                    warehouseID: stockMutation.warehouseID
                                }, include: {
                                    productVariant: {
                                        include: {
                                            product: {
                                                select:{
                                                    name:true
                                                }
                                            }
                                        }
                                    }
                                }
                            })  
                            if (!currentStock) throw "Product variant not found."
                            if (currentStock!.stock < variant[i].qty && type == "REMOVE") throw `Failed to remove, insufficient stock at ${wareHouseList!.warehouseName} (${currentStock!.stock}, ${currentStock?.productVariant.color}, ${variant[i].size.toUpperCase()})`       
                            const newStockLog = await tx.stockMutationItem.create({
                                data: {
                                    id: uuidv4(),
                                    quantity: variant[i].qty,
                                    stockMutationID: stockMutation.id,
                                    warehouseProductID: currentStock!.id
                                }
                            })                                                       
                            await tx.warehouseProduct.update({
                                where: {
                                    id: currentStock?.id,
                                }, 
                                data: {
                                    stock: Number(mutationType == "RESTOCK" || mutationType === "INBOUND"
                                        ? newStockLog.quantity + currentStock!.stock 
                                        : currentStock!.stock > newStockLog.quantity
                                        ? currentStock!.stock - newStockLog.quantity
                                        : 0
                                    )
                                }
                            })     
                        }
                    }
                } 
                const getProduct = await tx.productVariant.findUnique({
                    where: {
                        id: variant[0].id
                    }, select: {
                        product: {
                            select: {
                                id: true
                            }
                        }
                    }
                })
                await tx.product.update({
                    data: {
                        stockUpdatedAt: new Date()
                    },
                    where: {
                        id: getProduct!.product.id
                    }
                })
                return res.status(200).send({
                    status: 'ok',
                    message: 'stock updated'
                }) 
            })     
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }
}