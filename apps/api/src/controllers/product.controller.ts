import { Request, Response } from 'express';
import prisma from '@/prisma';
import { v4 as uuidv4 } from 'uuid';
import { editProduct } from '@/services/product/edit.action';
import { createProduct } from '@/services/product/create.action';
import { serverResponse } from '@/helpers/apiResponse';
import { ProductGender, ProductTypes } from '@prisma/client';

enum ProductSize { S = 'S', M = 'M', L = 'L', XL = 'XL' }

export class ProductController {
    async createProduct(req: Request, res: Response) {
        try {
            await createProduct(req, res)
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getProductName(req: Request, res: Response) {
        try {
            const { n } = req.query;
            const query: any = {
                select: {
                    name: true,
                    slug: true
                },
                where: {
                    name: n ? { contains: String(n) } : { not: undefined }
                },
                orderBy: {
                    name: 'asc'
                }
            }
            if (n) {
                query.take = 6;
            }
            const productNameList = await prisma.product.findMany(query);
        
            serverResponse(res, 200, 'ok', 'product name found.', productNameList);
        } catch (error: any) {
            serverResponse(res, 400, 'error', error);
        }
    }

    async getProduct(req: Request, res: Response) {
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
                                    },orderBy: {
                                        updatedAt: 'desc'
                                    }
                                }
                            },where: {
                                isDeleted: false
                            }
                        },
                        category: true,
                    },
                    where: {
                        name: q 
                        ? {contains: String(q)}
                        : {not: undefined},
                        createdAt: {gte: fromDate, lte: toDate},
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
                                isDeleted: false,
                            }
                        }
                    },
                    orderBy: {
                        updatedAt: 'desc'
                    },
                    take: +limit, 
                    skip: (+p! - 1) * +limit
                })
                
                const productsWithStock = products.map(product => ({
                    ...product,
                    variants: product.variants.map(variant => ({
                    ...variant,
                    totalStock: variant.warehouseProduct.reduce((total, wp) => total + wp.stock, 0)
                    }))
                }));
            
                const productList = productsWithStock.map(product => ({
                    ...product,
                    totalStock: product.variants.reduce((total, variant) => {
                    return total + variant.warehouseProduct.reduce((variantTotal, wp) => variantTotal + wp.stock, 0);
                    }, 0)
                }));

                const totalStock = await tx.warehouseProduct.aggregate({
                    _sum: {
                        stock: true
                    },
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

    // async getProductBySlug(req: Request, res: Response) {
    //     try {
    //         const {slug} = req.params
    //         const {w, s} = req.query
    //         await prisma.$transaction(async (tx)=> {
    //             const products = await tx.product.findFirst({
    //                 where: {
    //                     slug,
    //                     variants: {
    //                         some: {
    //                             isDeleted: false,
    //                             warehouseProduct: {
    //                                 some: {
    //                                     warehouse: {
    //                                         warehouseName: w ? String(w) : {not: undefined},
    //                                     },
    //                                     size: s ? String(s).toUpperCase() as ProductSize : {not: undefined},
    //                                     isDelete: false
    //                                 }
    //                             }
    //                         }
    //                     }
    //                 },
    //                 include: {
    //                     images: true,
    //                     variants: {
    //                         include: {
    //                             warehouseProduct: {
    //                                 where: {
    //                                     warehouse: {
    //                                         warehouseName: w ? String(w) : {not: undefined},
    //                                     },
    //                                     size: s ? String(s).toUpperCase() as ProductSize : {not: undefined},
    //                                     isDelete: false
    //                                 }
    //                                 ,orderBy: {
    //                                     updatedAt: 'desc'
    //                                 }
    //                             }
    //                         }
    //                     },
    //                     category: true
    //                 }
    //             })
                
    //             const productsWithStock = {
    //                 ...products,
    //                 variants: products!.variants.map((variant:any) => ({
    //                 ...variant,
    //                 totalStock: variant.warehouseProduct.reduce((total:any, wp:any) => total + wp.stock, 0)
    //                 }))
    //             }
            
    //             const productList = {
    //                 ...productsWithStock,
    //                 totalStock: products!.variants.reduce((total:any, variant:any) => {
    //                 return total + variant.warehouseProduct.reduce((variantTotal:any, wp:any) => variantTotal + wp.stock, 0);
    //                 }, 0)
    //             }

    //             const sizeSum = await tx.warehouseProduct.groupBy({
    //                 by: ['size'!, 'productVariantID'],
    //                 _sum: {
    //                     stock: true
    //                 }, 
    //                 where: {
    //                     productVariant: {
    //                         product: {
    //                             slug
    //                         }
    //                     },
    //                 },

    //             })
                
    //             return res.status(200).send({
    //                 status: 'ok',
    //                 message: 'product found',
    //                 productList,
    //                 sizeSum
    //             })
                    
    //         })
    //     } catch (error:any) {
    //         serverResponse(res, 400, 'error', error)
    //     } 
    // }

    async getProductBySlug(req: Request, res: Response) {
        try {
            const {slug} = req.params
            const {w, s} = req.query
            await prisma.$transaction(async (tx)=> {
                if (w === "All Warehouses" || w === '') {
                    if (s) {
                        const products = await tx.product.findFirst({
                            where: {
                                slug
                            },
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
                                            },orderBy: {
                                                updatedAt: 'desc'
                                            }, where: {
                                                size: String(s).toUpperCase() as ProductSize,
                                                isDelete: false
                                            }
                                        }
                                    },
                                    where: {
                                        isDeleted: false
                                    }
                                },
                                category: true
                            }
                        })

                        if (!products) throw 'No product found.'
                        const productsWithStock = {
                            ...products,
                            variants: products!.variants.map((variant:any) => ({
                            ...variant,
                            totalStock: variant.warehouseProduct.reduce((total:any, wp:any) => total + wp.stock, 0)
                            }))
                        }
                    
                        const productList = {
                            ...productsWithStock,
                            totalStock: products!.variants.reduce((total:any, variant:any) => {
                            return total + variant.warehouseProduct.reduce((variantTotal:any, wp:any) => variantTotal + wp.stock, 0);
                            }, 0)
                        }
                        
                        return res.status(200).send({
                            status: 'ok',
                            message: 'product found',
                            productList
                        })
                    } else {
                        const products = await tx.product.findFirst({
                            where: {
                                slug
                            },
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
                                            },orderBy: {
                                                updatedAt: 'desc'
                                            },where: {
                                                isDelete: false
                                            }
                                        }
                                    }, where: {
                                        isDeleted: false
                                    }
                                },
                                category: true
                            }
                        })
                        if (!products) throw 'No product found.'
                        const productsWithStock = {
                            ...products,
                            variants: products!.variants.map((variant:any) => ({
                            ...variant,
                            totalStock: variant.warehouseProduct.reduce((total:any, wp:any) => total + wp.stock, 0)
                            }))
                        }
                    
                        const productList = {
                            ...productsWithStock,
                            totalStock: products!.variants.reduce((total:any, variant:any) => {
                            return total + variant.warehouseProduct.reduce((variantTotal:any, wp:any) => variantTotal + wp.stock, 0);
                            }, 0)
                        }

                        const sizeSum = await tx.warehouseProduct.groupBy({
                            by: ['size'!, 'productVariantID'],
                            _sum: {
                                stock: true
                            }, 
                            where: {
                                productVariant: {
                                    product: {
                                        slug
                                    }
                                },
                            },

                        })
                        
                        console.log(sizeSum);
                        
                        
                        return res.status(200).send({
                            status: 'ok',
                            message: 'product found',
                            productList,
                            sizeSum
                        })
                    }
                } else {
                    if (s) {
                        const products = await tx.product.findFirst({
                            where: {
                                slug,
                            },
                            include: {
                                images: true,
                               variants: {
                                    include: {
                                        warehouseProduct: {
                                            where: {
                                                warehouse: {
                                                    warehouseName: String(w)
                                                }, 
                                                size: String(s).toUpperCase() as ProductSize,
                                                isDelete: false

                                            },
                                            select: {
                                                warehouseID: true,
                                                id: true,
                                                size: true,
                                                stock: true,
                                                updatedAt: true,
                                            },orderBy: {
                                                updatedAt: 'desc'
                                            }
                                        }
                                    }, where: {
                                        isDeleted: false
                                    }
                                },
                                category: true
                            }
                        })
                        if (!products) throw 'No product found.'
                        const productsWithStock = {
                            ...products,
                            variants: products!.variants.map((variant:any) => ({
                            ...variant,
                            totalStock: variant.warehouseProduct.reduce((total:any, wp:any) => total + wp.stock, 0)
                            }))
                        }
                    
                        const productList = {
                            ...productsWithStock,
                            totalStock: products!.variants.reduce((total:any, variant:any) => {
                            return total + variant.warehouseProduct.reduce((variantTotal:any, wp:any) => variantTotal + wp.stock, 0);
                            }, 0)
                        }
                        
                        return res.status(200).send({
                            status: 'ok',
                            message: 'product found',
                            productList
                        })
                    } else {
                        const products = await tx.product.findFirst({
                            where: {
                                slug,
                            },
                            include: {
                                images: true,
                               variants: {
                                    include: {
                                        warehouseProduct: {
                                            where: {
                                                warehouse: {
                                                    warehouseName: String(w),
                                                }, isDelete: false
                                            },
                                            select: {
                                                warehouseID: true,
                                                id: true,
                                                size: true,
                                                stock: true,
                                                updatedAt: true,
                                            },orderBy: {
                                                updatedAt: 'desc'
                                            }
                                        }
                                    }, where: {
                                        isDeleted: false
                                    }
                                },
                                category: true
                            }
                        })
                        if (!products) throw 'No product found.'
                        const productsWithStock = {
                            ...products,
                            variants: products!.variants.map((variant:any) => ({
                            ...variant,
                            totalStock: variant.warehouseProduct.reduce((total:any, wp:any) => total + wp.stock, 0)
                            }))
                        }
                    
                        const productList = {
                            ...productsWithStock,
                            totalStock: products!.variants.reduce((total:any, variant:any) => {
                            return total + variant.warehouseProduct.reduce((variantTotal:any, wp:any) => variantTotal + wp.stock, 0);
                            }, 0)
                        }
                        return res.status(200).send({
                            status: 'ok',
                            message: 'product found',
                            productList
                        })
                    }
                }
            })
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        } 
    }

    async editProduct(req: Request, res: Response) {
        try {
            await editProduct(req, res);
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async deleteProduct(req:Request, res:Response) {
        try {
            const {slug} = req.params
            await prisma.$transaction(async (tx) => {
                await tx.stockMutationItem.deleteMany({
                    where: {
                        WarehouseProduct: {
                            productVariant: {
                                product: {
                                    slug
                                }
                            }
                        }
                    }
                })

                await tx.warehouseProduct.deleteMany({
                    where: {
                        productVariant: {
                            product: {
                                slug
                            }
                        }
                    }
                })

                await tx.productVariant.deleteMany({
                    where: {
                        product: {
                            slug
                        }
                    }
                })
                await tx.productImage.deleteMany({
                    where: {
                        product: {
                            slug
                        }
                    }
                })

                await tx.product.delete({
                    where: {
                        slug
                    }
                })
                
                return res.status(200).send({
                    status: 'ok',
                    message: 'Product deleted.'
                })
            })
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getCatalogs(req: Request, res:Response) {
        try {
            const {g, t, c, p, l, s, q} = req.query   
            
            let limit = l ? l : 10            
            let sort = 'createdAt'
            let direction = 'desc'
            if (s == 'a-z') {
                sort = 'name'
                direction = 'asc'
            }
            if (s == 'low-to-high') {
                sort = 'price'
                direction = 'asc'
            }
            if (s == 'high-to-low') {
                sort = 'price'
                direction = 'desc'
            } 

            const products = await prisma.product.findMany({
                where: {
                    name: q
                    ? String(q)
                    : {not: undefined},
                    category: {
                        slug: c 
                        ? String(c)
                        : {not: undefined},
                        type: t 
                        ? String(t).toUpperCase() as ProductTypes
                        : {not: undefined},
                        gender: g
                        ? String(g).toUpperCase() as ProductGender
                        : {not: undefined}
                    },
                    isActive: true,
                },
                include: {
                    images: true,
                    variants: {
                        include: {
                            warehouseProduct: {
                                select: {
                                    stock: true,
                                },
                                where: {
                                    isDelete: false
                                }
                            }
                        },
                        where: {
                            isDeleted: false
                        }
                    },
                    category: true
                },
                orderBy: {
                    [sort]: direction
                }
            });
            
            // Calculate total stock for each variant and product
            const productsWithStock = products.map(product => ({
                ...product,
                variants: product.variants.map(variant => ({
                    ...variant,
                    totalStock: variant.warehouseProduct.reduce((total, wp) => total + wp.stock, 0)
                }))
            }));
            
            const productWithAndWithoutStock = productsWithStock.map(product => ({
                ...product,
                totalStock: product.variants.reduce((total, variant) => total + variant.totalStock, 0),
            }));
            
            
            // Separate products with stock from those without stock
            const productsWithStockOnly = productWithAndWithoutStock.filter(product => product.totalStock > 0);
            const productsWithoutStockOnly = productWithAndWithoutStock.filter(product => product.totalStock === 0);
            
            // Combine both lists with products with stock first
            const combinedProductList = [...productsWithStockOnly, ...productsWithoutStockOnly];
            
            // Apply pagination to the combined list
            const paginatedProductList = combinedProductList.slice((+p! - 1) * +limit, +p! * +limit);

            
            const totalProduct = await prisma.product.count({
                where: {
                    name: q
                    ? String(q)
                    : {not: undefined},
                    category: {
                        slug: c 
                        ? String(c)
                        : {not: undefined},
                        type: t
                        ? String(t).toUpperCase() as ProductTypes
                        : {not: undefined},
                        gender: g
                        ? String(g).toUpperCase() as ProductGender
                        : {not: undefined}
                    },
                    isActive: true,
                },
            });
            
            return res.status(200).send({
                status: 'ok',
                message: 'product found',
                productList: paginatedProductList,
                totalProduct,
            });                
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }

}


