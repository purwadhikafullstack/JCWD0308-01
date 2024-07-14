import { Request, Response } from 'express';
import prisma from '@/prisma';
import { serverResponse } from '@/helpers/apiResponse';
import { ProductGender, ProductTypes } from '@prisma/client';

export class SalesController {
    async getAllSales(req: Request, res: Response) {
        const {w, p, l} = req.query
        const { date, g, t, c, q } = req.body;
        const limit = l ? l : 10
        const fromDate = new Date(date.from);
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(date.to);
        toDate.setHours(23, 59, 59, 999);     
   
        try {
            let warehouse = await prisma.warehouse.findFirst({
                where: {
                    warehouseName: String(w)
                }
            })

            const salesProduct = await prisma.product.findMany({
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
                            orderItems: {
                                some: {
                                    order:{
                                        status: 'COMPLETED',
                                        warehouseId: warehouse ? warehouse.id : { not: undefined },
                                        createdAt: {
                                            gte: fromDate,
                                            lte: toDate
                                        },
                                    },
                                }
                            }
                        }
                    }
                },
                include: {
                    category: true,
                },
                take: +limit, 
                skip: (+p! - 1) * +limit,
            })
            const SalesList = await Promise.all(salesProduct.map(async (item) => {
                let analytics = null;
            
                analytics= await prisma.orderItem.aggregate({
                    _sum: {price:true, quantity: true},
                    _count: {id: true},
                    where: {
                        productVariant: {
                            product: {
                                id: item.id
                            }
                        },
                        order: {
                            status: 'COMPLETED',
                            warehouseId: warehouse ? warehouse.id : { not: undefined },
                            createdAt: {
                                gte: fromDate,
                                lte: toDate
                            },
                        }
                    }
                })
            
                return {
                    ...item,
                    analytics
                };
            }));
            
            const totalSales = await prisma.orderItem.aggregate({
                where: {
                    order: {
                        status: 'COMPLETED',
                        warehouseId: warehouse ? warehouse.id : { not: undefined },
                    },
                    productVariant: {
                        product: {
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
                        }
                    }
                },
                _sum: {
                    price: true,
                    quantity: true
                },
                _count: true
            })


            res.status(200).send({
                status: 'ok',
                message: 'sales found',
                SalesList,
                totalSales
            })
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }
    async getSalesSlug(req: Request, res: Response) {
        const {w, p, l} = req.query
        const {slug} = req.params
        const limit = l ? l : 10
        const { date, v, s } = req.body;
        const fromDate = new Date(date.from);
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(date.to);
        toDate.setHours(23, 59, 59, 999);     
        let size = s == 'One Size' ? 'ONESIZE' : String(s).toUpperCase() 
        
        try {
            const validSlug = await prisma.product.findFirst({
                where: {
                    slug
                }
            })

            if (!validSlug) throw 'No product found.'

            const warehouse = await prisma.warehouse.findFirst({
                where: {
                    warehouseName: String(w)
                }
            })

            const productSales = await prisma.orderItem.findMany({
                where: {
                    color: v
                    ? String(v) 
                    : {not: undefined},
                    size: size
                    ? size
                    : {not: undefined},
                    productVariant: {
                        product: {
                            slug
                        }
                    },
                    updatedAt: {gte: fromDate, lte: toDate},
                    order: {
                        status: 'COMPLETED',
                        warehouseId: warehouse 
                        ? warehouse.id
                        : {not: undefined},
                    }
                },
                include: {
                    order: {
                        include: {
                            user: {
                                select: {
                                    addresses: {
                                        select: {
                                            city_name: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    productVariant: {
                        include: {
                            product: true
                        }
                    }
                },
                take: +limit, 
                skip: (+p! - 1) * +limit,
            })

            const totalGross = await prisma.orderItem.aggregate({
                where: {
                    productVariant: {
                        product: {
                            slug
                        }
                    },
                    updatedAt: {gte: fromDate, lte: toDate},
                    order: {
                        status: 'COMPLETED',
                        warehouseId: warehouse 
                        ? warehouse.id
                        : {not: undefined},
                    }
                },
                _sum: {
                    price: true,
                    quantity: true
                },
                _count: true
            })

            res.status(200).send({
                status: 'ok',
                message: 'Sales details found.',
                productSales,
                totalGross
            })

        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }
}