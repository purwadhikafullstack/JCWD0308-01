import { Request, Response } from 'express';
import prisma from '@/prisma';
import { serverResponse } from '@/helpers/apiResponse';
import { handleNewWarehouseStock, handleWarehouseDelete } from '@/services/stock/stock.action';

export class WarehouseController {
    async getWarehouseList(req: Request, res: Response) {
        try {
            const {id} = req.params
            const adminRole = await prisma.admin.findFirst({
                where: {
                    id
                }
            })
            let wareHouseList
            if (adminRole?.role == 'superAdm') {
                wareHouseList = await prisma.warehouse.findMany()
            } else if (adminRole?.role == 'warAdm') {
                wareHouseList = await prisma.warehouse.findMany({
                    where: {
                        adminID: id
                    }
                })
            }
            res.status(200).json(wareHouseList)
        } catch (err) {
            res.status(500).json({ error: 'Failed to get warehouse list' });
        }
    }

    async getAvailableWarehouse(req: Request, res: Response) {
        try {
            const warehouses = await prisma.warehouse.findMany({ where: { adminID: null } });
            if (!warehouses) return serverResponse(res, 404, 'error', 'All warehouses are already occupied!')
            serverResponse(res, 200, 'ok', 'Warehouses found!', warehouses)
            
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async createWarehouse(req: Request, res: Response) {
        try {

            const { selectedCity, address, warehouseName, assignedAdmin } = req.body
            const city = await fetch(`https://api.rajaongkir.com/starter/city?id=${selectedCity}`, {
                method: 'GET',
                headers: { key: `${process.env.NEXT_PUBLIC_RAJA_ONGKIR_API_KEY}` }
            });
            const data = await city.json()
            const result = data.rajaongkir.results

            const newWarehouse = await prisma.warehouse.create({
                data: {
                    warehouseName: warehouseName,
                    coordinate: `${address}, ${result.type} ${result.city_name}, ${result.province}, Indonesia`,
                    address: address,
                    city_id: result.city_id,
                    province_id: result.province_id,
                    province: result.province,
                    type: result.type,
                    city_name: result.city_name,
                    postal_code: result.postal_code,
                    adminID: assignedAdmin ? assignedAdmin : null, 
                }
            })

            handleNewWarehouseStock(newWarehouse.id)

            serverResponse(res, 200, 'ok', 'Warehouse successfully created!')
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async getWarehouseByAdminId(req: Request, res: Response) {
        try {
            const warehouse = await prisma.warehouse.findFirst({ where: { adminID: req.params.id }});
            if (!warehouse) return serverResponse(res, 404, 'error', 'Admin has not been assigned to any warehouse')
            serverResponse(res, 200, 'ok', 'Assigned warehouse found!', warehouse)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }
    
    async getWarehouseFiltered(req: Request, res: Response) {
        try {
            const {filter} = req.params
            console.log(filter);
            const warehouseList = await prisma.warehouse.findMany({
                where: {
                    warehouseName: {not: filter}
                }
            })
            serverResponse(res, 200, 'ok', 'warehouse found', warehouseList)
        } catch (error:any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getWarehouses(req: Request, res: Response) {
        try {
            const warehouses = await prisma.warehouse.findMany();
            if (!warehouses) return serverResponse(res, 404, 'error', 'Warehouse not found')
            serverResponse(res, 200, 'ok', 'Warehouses found!', warehouses)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async assignAdminToWarehouse(req: Request, res: Response) {
        try {
            const warehouse = await prisma.warehouse.findFirst({ where: { id: req.body.warehouseId }});
            const admin = await prisma.admin.findFirst({ where: { id: req.body.adminId }});
            if (!warehouse) return serverResponse(res, 404, 'error', 'Warehouse not found')
            if (!admin) return serverResponse(res, 404, 'error', 'Admin not found')
            const assignedWarehouse  = await prisma.warehouse.findFirst({ where: { adminID: admin.id } });
            if (assignedWarehouse?.warehouseName == warehouse.warehouseName) return serverResponse(res, 404, 'error', `${ admin.fullName } has been assigned to ${ assignedWarehouse.warehouseName } warehouse.`)
            if (assignedWarehouse) return serverResponse(res, 404, 'error', `${ admin.fullName } has been assigned to ${ assignedWarehouse.warehouseName } warehouse. One warehouse can only be assigned to one admin.`)
            await prisma.warehouse.update({ where: { id: warehouse.id }, data: { adminID: admin.id } })
            serverResponse(res, 200, 'ok', `${admin.fullName} is successfully assigned to ${warehouse.warehouseName} warehouse`, warehouse)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async dissmissAdminFromWarehouse(req: Request, res: Response) {
        try {
            const warehouse = await prisma.warehouse.findFirst({ where: { id: req.body.warehouseId }});
            const admin = await prisma.admin.findFirst({ where: { id: req.body.adminId }});
            if (!warehouse) return serverResponse(res, 404, 'error', 'Warehouse not found')
            if (!admin) return serverResponse(res, 404, 'error', 'Admin not found')
            if (!warehouse.adminID) return serverResponse(res, 404, 'error', `No admin is assigned at ${ warehouse.warehouseName } warehouse, yet`)
            if (warehouse.adminID != admin.id) return serverResponse(res, 404, 'error', 'Admin ID does not match with the assigned admin with related warehouse')
            await prisma.warehouse.update({ where: { id: warehouse.id }, data: { adminID: null } })
            serverResponse(res, 200, 'ok', `${admin.fullName} is successfully dismissed from ${warehouse.warehouseName} warehouse`)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async deactivateWarehouse(req: Request, res: Response) {
        try {
            const warehouse = await prisma.warehouse.findFirst({ where: { id: req.params.id }});
            if (!warehouse) return serverResponse(res, 404, 'error', 'Warehouse not found')
            if (!warehouse.isActive) return serverResponse(res, 400, 'error', 'Warehouse is already deactivated')
            if (warehouse.adminID) await prisma.warehouse.update({ where: { id: warehouse.id }, data: { adminID: null } })
            handleWarehouseDelete(warehouse.id)  
            await prisma.warehouse.update({ where: { id: warehouse.id }, data: { isActive: false } })
            serverResponse(res, 200, 'ok', `${warehouse?.warehouseName} warehouse is successfully deactivated` )
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async reactivateWarehouse(req: Request, res: Response) {
        try {
            const warehouse = await prisma.warehouse.findFirst({ where: { id: req.params.id }});
            if (!warehouse) return serverResponse(res, 404, 'error', 'Warehouse not found')
            if (warehouse.isActive) return serverResponse(res, 400, 'error', `${ warehouse.warehouseName }Warehouse is still active`)
            await prisma.warehouse.update({ where: { id: warehouse.id }, data: { isActive: true } })
            serverResponse(res, 200, 'ok', `${ warehouse.warehouseName } warehouse is successfully reactivated`)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async editWarehouse(req: Request, res: Response) {
        try {

            const { selectedCity, address, warehouseName, assignedAdmin } = req.body
            const city = await fetch(`https://api.rajaongkir.com/starter/city?id=${selectedCity}`, {
                method: 'GET',
                headers: { key: `${process.env.NEXT_PUBLIC_RAJA_ONGKIR_API_KEY}` }
            });
            const data = await city.json()
            const result = data.rajaongkir.results

            const warehouse = await prisma.warehouse.update({
                where: {
                    id: req.params.id
                },
                data: {
                    warehouseName: warehouseName,
                    coordinate: `${address}, ${result.type} ${result.city_name}, ${result.province}, Indonesia`,
                    address: address,
                    city_id: result.city_id,
                    province_id: result.province_id,
                    province: result.province,
                    type: result.type,
                    city_name: result.city_name,
                    postal_code: result.postal_code,
                    adminID: assignedAdmin ? assignedAdmin : null, 
                }
            })

            serverResponse(res, 200, 'ok', `${ warehouse.warehouseName } warehouse is successfully updated!`)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async getWarehouseById(req: Request, res: Response) {
        try {
            const warehouse = await prisma.warehouse.findFirst({ where: { id: req.params.id }});
            if (!warehouse) return serverResponse(res, 404, 'error', 'Warehouse not found')
            if (!warehouse.isActive) return serverResponse(res, 400, 'error', `${ warehouse.warehouseName }Warehouse is not active`)
            serverResponse(res, 200, 'ok', `${ warehouse.warehouseName } warehouse found`, warehouse)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

}
