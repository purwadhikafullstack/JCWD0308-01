import { Request, Response } from "express";
import prisma from "@/prisma";
import {v4 as uuidv4} from 'uuid'
import { serverResponse } from "@/helpers/apiResponse";
import { MutationTypes, ProductGender, ProductSize, ProductTypes } from "@prisma/client";



export class StockController {
    async createStock(req: Request, res:Response) {
        enum ProductSize {S = 'S', M = 'M', L = 'L', XL = 'XL'}
        try {
            const sizeArray: ProductSize[] = [ProductSize.S, ProductSize.M, ProductSize.L, ProductSize.XL];
            const {warehouseName, type, variant} =req.body
            if (!warehouseName || !type || !variant) throw "Invalid stock data input."
            if (["RESTOCK", "TRANSFER", "RESTOCK", "REMOVE", "TRANSACTION", "INBOUND", "DELETE"].includes(type) == false) throw "Invalid stock data input."
            const mutationType = type.toUpperCase() 
            const warehouseCheck = await prisma.warehouse.findFirst()
            if (!warehouseCheck) throw 'There is no existing warehouse.'           
            
            if (warehouseName === "All Warehouses" || warehouseName==='') {
                const wareHouseList = await prisma.warehouse.findMany({
                        where: {
                            isActive: true
                        }
                    })
                    await prisma.$transaction(async (tx) => {
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
                                        let currentStock
                                         currentStock = await tx.warehouseProduct.findFirst({
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
                                        if (!currentStock) {
                                            currentStock = await tx.warehouseProduct.create({
                                                data: {
                                                    id: uuidv4(),
                                                    size: sizeArray[k],
                                                    stock: 0,
                                                    isDelete: false,
                                                    productVariantID: variant[i].id,
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
                                        }
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
                                } 
                                else {
                                    let currentStock
                                    currentStock = await tx.warehouseProduct.findFirst({
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
                                    if (!currentStock) {
                                        currentStock = await tx.warehouseProduct.create({
                                            data: {
                                                id: uuidv4(),
                                                size: variant[i].size.toUpperCase(),
                                                stock: 0,
                                                isDelete: false,
                                                productVariantID: variant[i].id,
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
                                    }
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
                    })
                } else {
                    await prisma.$transaction(async (tx) => {
                        const wareHouseList = await tx.warehouse.findFirst({
                            where: {
                                warehouseName,
                                isActive: true
                            }
                        })
                        if (!wareHouseList) throw "Warehouse is inactive, please activate the warehouse."                  
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
                                    let currentStock
                                    currentStock = await tx.warehouseProduct.findFirst({
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
                                    if (!currentStock) {
                                        currentStock = await tx.warehouseProduct.create({
                                            data: {
                                                id: uuidv4(),
                                                size: sizeArray[k],
                                                stock: 0,
                                                isDelete: false,
                                                productVariantID: variant[i].id,
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
                                    }
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
                                let currentStock
                                currentStock = await tx.warehouseProduct.findFirst({
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
                                if (!currentStock) {
                                    currentStock = await tx.warehouseProduct.create({
                                        data: {
                                            id: uuidv4(),
                                            size: variant[i].size.toUpperCase(),
                                            stock: 0,
                                            isDelete: false,
                                            productVariantID: variant[i].id,
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
                                }
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
                    })
                } 
                const getProduct = await prisma.productVariant.findUnique({
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
                await prisma.product.update({
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
                
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getStockByVariant(req: Request, res: Response) {
        try {
            const {s, w} = req.query
            const {variant} = req.params
            if (w && !s) {
                const stock = await prisma.warehouseProduct.groupBy({
                    by: ['size'],
                    _sum: {
                        stock: true
                    }, 
                    where: {
                        productVariantID: String(variant),
                        warehouse: {
                            warehouseName: String(w)
                        }
                    },
                })
                const totalStock = await prisma.warehouseProduct.aggregate({
                    _sum: {
                        stock: true
                    }, 
                    where: {
                        productVariantID: String(variant),
                    },
                })
                serverResponse(res, 200, 'ok', 'stock found', {stock, totalStock})
            }
            else if (w && s) {
                const stock = await prisma.warehouseProduct.aggregate({
                    _sum: {
                        stock: true
                    }, 
                    where: {
                        productVariantID: String(variant),
                        size: String(s).toUpperCase() as ProductSize,
                        warehouse: {
                            warehouseName: String(w)
                        }
                    },
                })
                serverResponse(res, 200, 'ok', 'stock found', stock._sum)
            } else {
                const stock = await prisma.warehouseProduct.aggregate({
                    _sum: {
                        stock: true
                    }, 
                    where: {
                        productVariantID: String(variant),
                        size: String(s).toUpperCase() as ProductSize,
                    },
                })
                serverResponse(res, 200, 'ok', 'stock found', stock._sum)
            }
        } catch (error) {
            serverResponse(res, 400, 'error', 'stock not found', error)
        }
        
    }

    async getAllStock(req: Request, res: Response) {
        try {
            const {w, p, l} = req.query
            const { date, g, t, c, q } = req.body;
            const limit = l ? l : 10
            const fromDate = new Date(date.from);
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(date.to);
            toDate.setHours(23, 59, 59, 999);              

            await prisma.$transaction(async (tx)=> {
                const products = await tx.product.findMany({
                    include: {
                        images: true,
                        variants: {
                            include: {
                                warehouseProduct: {
                                    select: {
                                        warehouseID: true,
                                        id: true,
                                        size: true,
                                        stock: true,
                                        updatedAt: true,
                                    }
                                }
                            },where: {
                                isDeleted: false
                            },
                        },
                        category: true,
                    },
                    where: {
                        name: q 
                        ? {contains: String(q)}
                        : {not: undefined},
                        category: {
                            gender: g 
                            ? String(g).toUpperCase() as ProductGender 
                            : { not: undefined },
                            type: t 
                            ? String(t).toUpperCase() as ProductTypes
                            : { not: undefined },
                            category: c
                            ? String(c)
                            : {not: undefined}
                        },
                        variants: {
                            some: {
                                warehouseProduct: {
                                    some: {
                                        warehouse: {
                                            warehouseName: w ? String(w) : { not: undefined },
                                        }
                                    }
                                }
                            }
                        }
                    },
                    take: +limit, 
                    skip: (+p! - 1) * +limit,
                    orderBy: {
                        stockUpdatedAt: 'desc'
                    }
                })
                const productsWithStock = products.map(product => ({
                    ...product,
                    variants: product.variants.map(variant => ({
                    ...variant,
                    totalStock: variant.warehouseProduct.reduce((total, wp) => total + wp.stock, 0)
                    }))
                }));
                
                const productList = await Promise.all(productsWithStock.map(async (product) => {
                    const totalStock = await prisma.warehouseProduct.aggregate({
                        where: {
                            warehouse: {
                                warehouseName: w 
                                ? String(w)
                                : {not: undefined}
                            },
                            productVariant: {
                                product: {
                                    id: product.id
                                }
                            }
                        },
                        _sum: {
                            stock: true
                        }
                    })


                    const stockIn = await prisma.stockMutationItem.aggregate({
                    _sum: {
                        quantity: true,
                    },
                    where: {
                        WarehouseProduct: {
                        warehouse: {
                            warehouseName: w
                            ? String(w)
                            : {not: undefined}
                        },
                        productVariant: {
                            product: {
                            id: product.id
                            }
                        }
                        },
                        stockMutation: {
                            AND: [
                                { OR: [
                                    { AND : [
                                        {type: "INBOUND"},
                                        {status: 'ACCEPTED'}
                                        ]
                                    }, 
                                    { type: 'RESTOCK' }
                                ] },
                                { createdAt: { gte: fromDate, lte: toDate } }
                              ]
                        },
                    },
                    });                        
                
                    const stockOut = await prisma.stockMutationItem.aggregate({
                    _sum: {
                        quantity: true,
                    },
                    where: {
                        WarehouseProduct: {
                        warehouse: {
                            warehouseName: w
                            ? String(w)
                            : {not: undefined}
                        },
                        productVariant: {
                            product: {
                            id: product.id
                            }
                        }
                        },
                        stockMutation: {
                            AND: [
                                { OR: [
                                    { type: 'DELETE' }, 
                                    { type: 'REMOVE' }, 
                                    { type: 'TRANSACTION' },
                                    { AND: [
                                        {type: 'TRANSFER'},
                                        {status: 'ACCEPTED'}
                                    ] }, 
                                ] },
                                { createdAt: { gte: fromDate,lte: toDate } }
                              ]
                        },
                    },
                    });

                    const toDateStockIn = await prisma.stockMutationItem.aggregate({
                    _sum: {
                        quantity: true,
                    },
                    where: {
                        WarehouseProduct: {
                        warehouse: {
                            warehouseName: w
                            ? String(w)
                            : {not: undefined}
                        },
                        productVariant: {
                            product: {
                            id: product.id
                            }
                        }
                        },
                        stockMutation: {
                            AND: [
                                { OR: [
                                    { AND : [
                                        {type: "INBOUND"},
                                        {status: 'ACCEPTED'}
                                        ]
                                    }, 
                                    { type: 'RESTOCK' }
                                ] },
                                { createdAt: { lte: toDate } }
                              ]
                        },
                    },
                    });

                    console.log(toDateStockIn);
                    
                
                    const toDateStockOut = await prisma.stockMutationItem.aggregate({
                    _sum: {
                        quantity: true,
                    },
                    where: {
                        WarehouseProduct: {
                        warehouse: {
                            warehouseName: w
                            ? String(w)
                            : {not: undefined}
                        },
                        productVariant: {
                            product: {
                            id: product.id
                            }
                        }
                        },
                        stockMutation: {
                            AND: [
                                { OR: [
                                    { type: 'DELETE' }, 
                                    { type: 'REMOVE' }, 
                                    { type: 'TRANSACTION' },
                                    { AND: [
                                        {type: 'TRANSFER'},
                                        {status: 'ACCEPTED'}
                                    ] }, 
                                ] },
                                { createdAt: { lte: toDate } }
                              ]
                        },
                    },
                    });
                    
                    console.log(toDateStockOut);

                    const toDateStock = (toDateStockIn._sum.quantity?  toDateStockIn._sum.quantity : 0) - (toDateStockOut._sum.quantity ? toDateStockOut._sum.quantity : 0)
                
                    return {
                    ...product,
                    stockIn,
                    stockOut,
                    toDateStock,
                    totalStock:totalStock._sum.stock
                    };
                }));      
                
                const totalStock = await tx.warehouseProduct.aggregate({
                    _sum: {
                        stock: true
                    },
                    where: {
                        warehouse: {
                            warehouseName: w 
                            ? String(w)
                            : {not: undefined}
                        }
                    }
                })

                const totalProduct = await tx.product.count({
                    where: {
                        name: q 
                        ? {contains: String(q)}
                        : {not: undefined},
                        category: {
                            gender: g 
                            ? String(g).toUpperCase() as ProductGender 
                            : { not: undefined },
                            type: t 
                            ? String(t).toUpperCase() as ProductTypes
                            : { not: undefined },
                            category: c
                            ? String(c)
                            : {not: undefined}
                        },
                        variants: {
                            some: {
                                warehouseProduct: {
                                    some: {
                                        warehouse: {
                                            warehouseName: w ? String(w) : { not: undefined },
                                        }
                                    }
                                }
                            }
                        }
                    },
                })
                
                return res.status(200).send({
                    status: 'ok',
                    message: 'product found',
                    productList,
                    totalStock: totalStock._sum.stock,
                    totalProduct
                })
              
            })
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }     
    
    async getStockSlug(req: Request, res: Response) {
        const {w, p, l} = req.query
        const {slug} = req.params
        const { date, t, v, s } = req.body;
        const fromDate = new Date(date.from);
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(date.to);
        toDate.setHours(23, 59, 59, 999);  
        const limit = l ? l : 10
        
        let size = s == 'One Size' ? 'ONESIZE' : String(s).toUpperCase() 
        try {
            const validSlug = await prisma.product.findFirst({
                where: {
                    slug
                }
            })

            if (!validSlug) throw 'No product found.'

            const stocks = await prisma.stockMutationItem.findMany({
                where: {
                    WarehouseProduct: {
                        size: size
                        ? size as ProductSize
                        : {not: undefined},
                        productVariant: {
                            color: v 
                            ? String(v)
                            : {not: undefined},
                            product: { slug }
                        }
                    },stockMutation: {
                        createdAt: {
                            gte: fromDate,
                            lte: toDate
                        },
                        type: t ? String(t).toUpperCase() as MutationTypes
                        : { not: undefined },
                        warehouse: {
                            warehouseName: w ? String(w)
                            : { not: undefined }
                        },
                        OR: [
                            { status: "ACCEPTED" },
                            { status: null }
                        ]
                    }
                },
                include: {
                    stockMutation: true,
                    WarehouseProduct: {
                        include: {
                            productVariant: true,
                            warehouse: true
                        }
                    }
                },
                take: +limit, 
                skip: (+p! - 1) * +limit,
                orderBy: {
                    stockMutation: {
                        createdAt: 'desc'
                    }
                }
            })

            const totalData = await prisma.stockMutationItem.count({
                where: {
                    WarehouseProduct: {
                        size: size
                        ? size as ProductSize
                        : {not: undefined},
                        productVariant: {
                            color: v 
                            ? String(v)
                            : {not: undefined},
                            product: { slug }
                        }
                    },stockMutation: {
                        type: t ? String(t).toUpperCase() as MutationTypes
                        : { not: undefined },
                        warehouse: {
                            warehouseName: w ? String(w)
                            : { not: undefined }
                        },
                        OR: [
                            { status: "ACCEPTED" },
                            { status: null }
                        ]
                    }
                },
            })

            const stockList = await Promise.all(stocks.map(async (item) => {
                let associatedWH = null;
            
                if (item.stockMutation.associatedWarehouseID) {
                    associatedWH = await prisma.warehouse.findFirst({
                        where: {
                            id: item.stockMutation.associatedWarehouseID
                        }
                    });
                }
            
                return {
                    ...item,
                    associatedWH
                };
            }));
            res.status(200).send({
                status: 'ok',
                message: 'Stock data found',
                stockList,
                totalData
            })
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
            
        }
    }
    
}