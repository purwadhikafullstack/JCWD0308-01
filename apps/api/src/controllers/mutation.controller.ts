import { Request, Response } from "express";
import prisma from "@/prisma";
import {v4 as uuidv4} from 'uuid'
import { serverResponse } from "@/helpers/apiResponse";
import { MutationStatus, MutationTypes } from "@prisma/client";



export class MutationController {
    async createMutationRequest(req: Request, res:Response) {
        const {selectedWH, targetWH, variant, size, qty} = req.body
        try {
            await prisma.$transaction(async (tx) => {
                const current = await tx.warehouse.findFirst({ where: { warehouseName: selectedWH } })
                if (!current) throw 'Invalid current warehouse.'
                const target = await tx.warehouse.findFirst({ where: { warehouseName: targetWH } })
                if (!target) throw 'Invalid target warehouse.'
                const product = await tx.warehouseProduct.findFirst({
                    where: {
                        isDelete: false,
                        productVariantID: variant,
                        size: size,
                        warehouseID: current!.id
                    }
                })
                const mutation = await tx.stockMutation.create({
                    data: {
                        id: uuidv4(),
                        type: "INBOUND",
                        status: "WAITING",
                        warehouseID: current!.id,
                        associatedWarehouseID: target!.id,
                    }
                })
                await tx.stockMutationItem.create({
                    data: {
                        id:uuidv4(),
                        quantity: qty,
                        stockMutationID: mutation.id,
                        warehouseProductID: product!.id,
                    }
                })
            })
            serverResponse(res, 200, 'ok', 'stock mutation request created.')
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
        
    }

    async getMutation(req: Request, res: Response) {
        const {wh} = req.params
        const {type, status, p, l} = req.query
        
       try {
        const warehouse = await prisma.warehouse.findFirst({
            where: {
                warehouseName: wh
            }
        })
        if (!warehouse) throw 'Invalid warehouse.'
        const mutationList = await prisma.stockMutation.findMany({
          where: {
            warehouseID: warehouse!.id,
            type: String(type).toUpperCase() as MutationTypes,
            status: status === 'completed'
              ? {
                  not: { equals: 'WAITING' },
                }
              : String(status).toUpperCase() as MutationStatus,
            StockMutationItem: {
              none: {
                WarehouseProduct: {
                  isDelete: true,
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            StockMutationItem: {
              include: {
                WarehouseProduct: {
                  include: {
                    productVariant: {
                      include: {
                        product: true,
                      },
                    },
                  },
                },
              },
            },
          },
          take: +l!,
          skip: (+p! - 1) * +l!,
        });        
        const formattedMutationList = await Promise.all(mutationList.map(async (mutation) => {
          const associatedWarehouse = await prisma.warehouse.findFirst({
            where: {
              id: mutation.associatedWarehouseID!,
            },
          });
        
          return {
            ...mutation,
            associatedWarehouseName: associatedWarehouse?.warehouseName,
          };
        }));
        const total = await prisma.stockMutation.count({
            where: {
                warehouseID: warehouse!.id,
                type: String(type).toUpperCase() as MutationTypes,
                status:  status === 'completed'
                ? {
                  not: 
                      {equals: 'WAITING' },
                  }
                : String(status).toUpperCase() as MutationStatus
            },
        })

        serverResponse(res, 200, 'ok', 'mutation found', {mutationList:formattedMutationList, total})
       } catch (error:any) {
        serverResponse(res, 400, 'error', error)
       }
    }

    async getMutationRequest(req: Request, res: Response) {
      const {wh} = req.params
      const {status, p, l} = req.query
      try {
        const warehouse = await prisma.warehouse.findFirst({
          where: {
              warehouseName: wh
          }
        })
        if (!warehouse) throw 'Invalid warehouse.'
        const mutationList = await prisma.stockMutation.findMany({
          where: {
            associatedWarehouseID: warehouse!.id,
            type: 'INBOUND',
            status: status === 'completed'
            ? {
              not: 
                  {equals: 'WAITING' },
              }
            : String(status).toUpperCase() as MutationStatus,
            StockMutationItem: {
              none: {
                WarehouseProduct: {
                  isDelete: true,
                },
              },
            },
          },orderBy: {
              createdAt: 'desc'
          },
          include: {
            StockMutationItem: {
              include: {
                WarehouseProduct: {
                  include: {
                    productVariant: {
                      include: {
                        product: true,
                      },
                    },
                  },
                },
              },
            },
          },
          take: +l!,
          skip: (+p! - 1) * +l!,
        });
        const formattedMutationList = await Promise.all(mutationList.map(async (mutation) => {
          const requestingWarehouse = await prisma.warehouse.findFirst({
            where: {
              id: mutation.warehouseID!,
            },
          });
        
          return {
            ...mutation,
            requestingWarehouse: requestingWarehouse?.warehouseName,
          };
        }));
        const total = await prisma.stockMutation.count({
            where: {
                associatedWarehouseID: warehouse!.id,
                type: "INBOUND",
                status: status === 'completed'
                ? {
                  not: 
                      {equals: 'WAITING' },
                  }
                : String(status).toUpperCase() as MutationStatus,
                },
        })

        serverResponse(res, 200, 'ok', 'mutation found', {mutationList:formattedMutationList, total})
      } catch (error:any) {
        serverResponse(res, 400, 'error', error)
      }
    }

    async acceptMutation(req: Request, res: Response) {
      const {id} = req.params
      try {
        await prisma.$transaction(async(tx) => {
          const mutation = await tx.stockMutation.update({
            data: {
              status: 'ACCEPTED',
              updatedAt: new Date()
            },
            where: {
              id
            },
            include: {
              StockMutationItem: {
                include: {
                  WarehouseProduct: {
                    include: {
                      productVariant: true
                    }
                  }
                }
              }
            }
          })       
          
          const whproduct = await tx.warehouseProduct.findFirst({
            where: {
              id: mutation.StockMutationItem[0].warehouseProductID,
              isDelete: false
            }
          })
          if (!whproduct) throw 'Product variant does not exists.'
          const wpUpdate = await tx.warehouseProduct.update({
            where: {
              id: mutation.StockMutationItem[0].warehouseProductID
            },
            data: {
              stock: whproduct!.stock + mutation.StockMutationItem[0].quantity
            },
            select: {
              productVariant: true
            }
          })
          await tx.product.update({
            data: {
              stockUpdatedAt: new Date()
            },
            where: {
              id: wpUpdate.productVariant.productID
            }
          })


          const mutationAsc = await tx.stockMutation.create({
            data: {
              id: uuidv4(),
              type: "TRANSFER",
              status: 'ACCEPTED',
              createdAt: new Date(),
              warehouseID: mutation.associatedWarehouseID!,
              associatedWarehouseID: mutation.warehouseID,
            },
            include: {
              StockMutationItem: true
            }
          })

          const whProductAsc = await tx.warehouseProduct.findFirst({
            where: {
              warehouseID: mutation.associatedWarehouseID!,
              isDelete: false,
              productVariantID: mutation.StockMutationItem[0].WarehouseProduct.productVariant.id,
              size: mutation.StockMutationItem[0].WarehouseProduct.size
            }
          })

          if (!whProductAsc) throw 'Product variant does not exists.'

          await tx.stockMutationItem.create({
            data: {
              id: uuidv4(),
              quantity: mutation.StockMutationItem[0].quantity,
              warehouseProductID: whProductAsc!.id,
              stockMutationID: mutationAsc.id,
            }
          })

          if (whProductAsc.stock < mutation.StockMutationItem[0].quantity) throw 'Stock at warehouse is lower than requested amount.'
          
          const wpUpdateAsc = await tx.warehouseProduct.update({
            where: {
              id: whProductAsc.id
            },
            data: {
              stock: whProductAsc!.stock - mutation.StockMutationItem[0].quantity
            },
            select: {
              productVariant: true
            }
          })

          await tx.product.update({
            data: {
              stockUpdatedAt: new Date()
            },
            where: {
              id: wpUpdateAsc.productVariant.productID
            }
          })
        })
        serverResponse(res, 200, 'ok', 'Stock successfully transfered.')
      } catch (error:any) {
        serverResponse(res, 400, 'error', error)
      }
    }

    async rejectMutation(req: Request, res: Response) {
      const {id} = req.params
      try {
        await prisma.stockMutation.update({
          data: {
            status: 'REJECTED',
            updatedAt: new Date()
          },
          where: {
            id
          },
        })
        serverResponse(res, 200, 'ok', 'Stock mutation rejected.')
      } catch (error) {
        serverResponse(res, 400, 'error')
      }
    }

    async cancelMutation(req:Request, res: Response) {
      const {id} = req.params
      try {
        await prisma.stockMutationItem.deleteMany({
          where: {
            stockMutationID: id
          }
        })
        await prisma.stockMutation.delete({
          where: {
            id
          },
        })
        serverResponse(res, 200, 'ok', 'Stock mutation request deleted.')
      } catch (error) {
        serverResponse(res, 400, 'error')
      }
    }
}