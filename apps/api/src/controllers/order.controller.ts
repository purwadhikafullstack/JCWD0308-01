import { addOrUpdateCartItem, deleteCart, deleteCartItem, getCart, getCartItem, getCartItemsByOrderId, getCartItemsWithTotal, getOrCreateCart, getStock, getStockByWarehouse, updateCartItem, updateToOrder } from "@/services/cart/cart.action";
import { cancelOrder, existingTransaction, failedOrder, getOrderByAdmin, getOrderById, getOrderByUser, getPaymentLink, getTotalOrderByAdmin, getTotalOrderByUser, getUserById, successOrder, updateCompletedOrder, updateShipped } from "@/services/order/order.action";
import { Request, Response } from "express";
import fs from "fs"
import handlebars from "handlebars"
import path from "path";
import { transporter } from '@/helpers/nodemailer';
import { findClosestWarehouse, getAddressById, getAddressCoordinates, getAllWarehouseAddress, getWarehouseById, getWarehouseByName } from "@/services/address/address.action";
import { generateInvoicePdf } from "@/helpers/pdf";
import { addStockWarehouse, createMutation, createMutationItem, createMutationTransaction, reduceStockWarehouse } from "@/services/stock/stock.action";

export class OrderController {

    async checkCart(req: Request, res: Response) {
        const { c } = req.query
        try {
            if (typeof c !== "string") throw 'Invalid request'
            const cart = await getCart(c)
            res.json(cart)
        } catch (err) {
            res.json(err)
        }
    }

    async addToCart(req: Request, res: Response) {
        const { userId, variantId, quantity, color, size } = req.body

        try {
            const cart = await getOrCreateCart(userId)

            await addOrUpdateCartItem(cart.id, variantId, color, size, quantity)

            await getCartItemsWithTotal(cart.id)

            const items = await getCartItem(userId)

            res.json(items)
        } catch (error) {
            res.json(error)
        }
    }

    async getCartItems(req: Request, res: Response) {
        try {
            const cart = await getCartItem(req.body.userId)
            if (cart !== null) {
                res.json(cart)
            } else {
                res.json({ message: 'no cart' })
            }
        } catch (error) {
            res.json(error)
        }
    }

    async updateCartItems(req: Request, res: Response) {
        const { itemId, newQuantity, userId } = req.body;

        try {
            await updateCartItem(itemId, newQuantity);

            const cart = await getCartItem(userId)
            res.status(200).json(cart);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update cart item' });
        }
    }

    async deleteCartItems(req: Request, res: Response) {
        const { itemId, userId } = req.body;
        try {
            await deleteCartItem(itemId)
            const cart = await getCartItem(userId)
            if (Array.isArray(cart?.items) && cart.items.length === 0) {
                await deleteCart(cart.id)
                res.json({ message: 'cart deleted' })
            } else {
                res.status(200).json(cart);
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete cart item' });
        }
    }

    async getOrderById(req: Request, res: Response) {
        try {
            const { orderId } = req.body
            const cart = await getOrderById(orderId)
            if (cart?.addressID !== null && cart) {
                const address = await getAddressById(cart?.addressID!)
                const warehouse = await getWarehouseById(cart?.warehouseId!)
                const shippingCost = cart?.totalAmount - cart?.items.reduce((acc, item) => acc + item.price, 0)

                res.json({ cart, address, warehouse: { coordinate: warehouse?.coordinate! }, shippingCost })
            } else {
                if (cart !== null) res.json(cart)
                res.json({ message: 'no cart' })
            }
        } catch (error) {
            res.json(error)
        }
    }

    async checkStock(req: Request, res: Response) {
        try {
            const { orderId } = req.body
            const stock = await getStock(orderId)

            res.json(stock)
        } catch (err) {
            res.json(err)
        }
    }

    async createOrder(req: Request, res: Response) {
        try {
            const { orderId, shippingCost, subTotal, warehouseId, userAddress, shipping, selectedShipping } = req.body
            const stockData = await getStock(orderId);
            const stockDataWarehouse = await getStockByWarehouse(orderId, warehouseId)
            const warehouse = await getWarehouseById(warehouseId)

            const outOfStockItems = stockData.filter(item => item.totalStock < item.orderedQuantity);

            if (outOfStockItems.length > 0) res.status(400).json({
                message: "Some items are out of stock",
            })

            const itemsToMutate = []
            for (const item of stockDataWarehouse) {
                if (item.totalStock < item.orderedQuantity) {
                    const warehouseAddress = await getAddressCoordinates(`${warehouse?.address}, ${warehouse?.city_name}, ${warehouse?.province}, Indonesia`)
                    const warehouses = await getAllWarehouseAddress()
                    const closestWarehouse = await findClosestWarehouse(warehouseAddress, warehouses)

                    for (const closest of closestWarehouse!) {
                        const closestWarehouseId = await getWarehouseByName(closest.warehouseKey)
                        const closestStockData = await getStockByWarehouse(orderId, closestWarehouseId?.id!)
                        const closestStock = closestStockData.find(stock => stock.productVariantId === item.productVariantId && stock.size === item.size)

                        if (closestStock && closestStock.totalStock >= item.orderedQuantity - item.totalStock) {
                            itemsToMutate.push({
                                productVariantId: item.productVariantId,
                                size: item.size,
                                quantity: item.orderedQuantity - item.totalStock,
                                fromWarehouse: closestWarehouseId,
                                toWarehouse: warehouseId
                            });

                            item.totalStock = item.orderedQuantity;
                            break;
                        }
                    }
                }
            }

            for (const mutation of itemsToMutate) {
                const createMutationSender = await createMutation(mutation.fromWarehouse?.id!, mutation.toWarehouse!, 'TRANSFER', 'ACCEPTED')
                await createMutationItem(createMutationSender, mutation.quantity, mutation.fromWarehouse?.id!, mutation.productVariantId, mutation.size)
                const createMutationInbound = await createMutation(mutation.toWarehouse!, mutation.fromWarehouse?.id!, 'INBOUND', 'ACCEPTED')
                await createMutationItem(createMutationInbound, mutation.quantity, mutation.fromWarehouse?.id!, mutation.productVariantId, mutation.size)

                await reduceStockWarehouse(mutation.fromWarehouse?.id!, mutation.productVariantId, mutation.size, mutation.quantity)
                await addStockWarehouse(mutation.toWarehouse, mutation.productVariantId, mutation.size, mutation.quantity)
            }

            const orderItems = await getCartItemsByOrderId(orderId)

            for (const item of orderItems) {
                const createMutationTransactions = await createMutationTransaction(warehouseId, 'TRANSACTION', 'ACCEPTED')
                await createMutationItem(createMutationTransactions.id, item.quantity, warehouseId, item.productVariantId, item.size)
            }

            const order = await updateToOrder(orderId, shippingCost, subTotal, warehouseId, userAddress, shipping, selectedShipping.service, selectedShipping.description, selectedShipping.cost[0].etd)
            if (order) {
                let data = {
                    transaction_details: {
                        order_id: order.id,
                        gross_amount: subTotal + shippingCost,
                    },
                    expiry: {
                        unit: 'minutes',
                        duration: 60
                    }
                }
                const paymentLink = await getPaymentLink(data)
                res.json(paymentLink)
            }
        } catch (err) {
            res.json(err)
        }
    }

    async checkStatus(req: Request, res: Response) {
        try {
            if (req.body.transaction_status === 'settlement') {
                const existTransaction = await existingTransaction(req.body.order_id)
                if (existTransaction) {
                    const updateOrder = await successOrder(req.body.order_id)
                    const user = await getUserById(updateOrder?.userId!)
                    const warehouse = await getWarehouseById(updateOrder?.warehouseId!)
                    const shippingCost = updateOrder?.totalAmount! - updateOrder?.items.reduce((acc, item) => acc + item.price, 0)!
                    const address = await getAddressById(updateOrder?.addressID!)

                    const templatePath = path.join(__dirname, "../templates", "invoice.html")
                    const templateSource = fs.readFileSync(templatePath, 'utf-8')
                    const compiledTemplate = handlebars.compile(templateSource)

                    const inputData = {
                        orderId: updateOrder.id,
                        name: user?.username,
                        status: updateOrder?.status,
                        paymentStatus: updateOrder?.paymentStatus,
                        orderItem: updateOrder?.items,
                        totalAmount: updateOrder?.totalAmount,
                        createdAt: updateOrder?.createdAt,
                        warehouse: warehouse?.warehouseName,
                        warehouseLoc: warehouse?.coordinate,
                        shippingCost: shippingCost,
                        address: address?.coordinate,
                        qrData: process.env.PUBLIC_URL + `/order/${updateOrder?.id}`
                    }

                    const html = compiledTemplate(inputData)

                    const pdf = await generateInvoicePdf(inputData)
                    await transporter.sendMail({
                        from: process.env.MAIL_USER,
                        to: user?.email,
                        subject: `Your Order Details on WearDrobe`,
                        html,
                        attachments: [{ path: pdf }]
                    })
                }
            } else if (req.body.transaction_status === 'failed') {
                await failedOrder(req.body.order_id);
            } else {
                return
            }
        } catch (err) {
            res.json(err)
        }
    }

    async getOrderByAdmin(req: Request, res: Response) {
        try {
            const { adminId, userId, date } = req.body
            let { q: query, page, limit, w } = req.query;

            if (typeof query !== "string") throw 'Invalid request'
            if (typeof w !== "string") throw 'Invalid request'
            if (typeof page !== "string" || isNaN(+page)) page = '1';
            if (typeof limit !== "string" || isNaN(+limit)) limit = '10'
            const fromDate = new Date(date.from);
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(date.to);
            toDate.setDate(toDate.getDate());
            toDate.setHours(23, 59, 0, 0);
            const warehouse = await getWarehouseByName(w)

            if (userId) {
                const orderList = await getOrderByUser(userId, query, page, limit, fromDate, toDate)
                const totalOrders = await getTotalOrderByUser(userId, query)
                const totalPages = Math.ceil(totalOrders / +limit)
                const currentPage = +page
                res.json({ orderList, totalPages, currentPage })
            }
            if (adminId) {
                const orderList = await getOrderByAdmin(adminId, query, page, limit, warehouse?.id!, fromDate, toDate)
                const totalOrders = await getTotalOrderByAdmin(adminId, query)
                const totalPages = Math.ceil(totalOrders! / +limit)
                const currentPage = +page
                res.json({ orderList, totalPages, currentPage })
            }
        } catch (err) {
            res.json(err)
        }
    }

    async cancelOrder(req: Request, res: Response) {
        try {
            const { orderId, adminId, userId, date } = req.body
            let { q: query, page, limit, w } = req.query;

            if (typeof query !== "string") throw 'Invalid request'
            if (typeof w !== "string") throw 'Invalid request'
            if (typeof page !== "string" || isNaN(+page)) page = '1';
            if (typeof limit !== "string" || isNaN(+limit)) limit = '10'
            const cancel = await cancelOrder(orderId)
            const fromDate = new Date(date.from);
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(date.to);
            toDate.setDate(toDate.getDate());
            toDate.setHours(23, 59, 0, 0);

            const warehouse = await getWarehouseByName(w)

            if (cancel) {
                if (adminId) {
                    const orderList = await getOrderByAdmin(adminId, query, page, limit, warehouse?.id!, fromDate, toDate)
                    res.json(orderList)
                }
                if (userId) {
                    const orderList = await getOrderByUser(userId, query, page, limit, fromDate, toDate)
                    res.json(orderList)
                }
            }
        } catch (err) {
            res.json(err)
        }
    }

    async changeToShipped(req: Request, res: Response) {
        try {
            const { orderId, adminId, date } = req.body
            let { q: query, page, limit, w } = req.query;
            if (typeof query !== "string") throw 'Invalid request'
            if (typeof w !== "string") throw 'Invalid request'
            if (typeof page !== "string" || isNaN(+page)) page = '1';
            if (typeof limit !== "string" || isNaN(+limit)) limit = '10'

            const fromDate = new Date(date.from);
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(date.to);
            toDate.setDate(toDate.getDate());
            toDate.setHours(23, 59, 0, 0);

            const updateToShipped = await updateShipped(orderId)

            if (updateToShipped) {
                const warehouse = await getWarehouseByName(w)
                const orderList = await getOrderByAdmin(adminId, query, page, limit, warehouse?.id!, fromDate, toDate)
                res.json(orderList)
            }
        } catch (err) {
            res.json(err)
        }
    }

    async confirmOrder(req: Request, res: Response) {
        try {
            const { orderId, userId, date } = req.body
            let { q: query, page, limit, w } = req.query;
            if (typeof query !== "string") throw 'Invalid request'
            if (typeof w !== "string") throw 'Invalid request'
            if (typeof page !== "string" || isNaN(+page)) page = '1';
            if (typeof limit !== "string" || isNaN(+limit)) limit = '10'

            const fromDate = new Date(date.from);
            fromDate.setHours(0, 0, 0, 0)
            const toDate = new Date(date.to);
            toDate.setDate(toDate.getDate());
            toDate.setHours(23, 59, 0, 0);

            const updateToCompleted = await updateCompletedOrder(orderId)
            if (updateToCompleted) {
                const orderList = await getOrderByUser(userId, query, page, limit, fromDate, toDate)
                res.json(orderList)
            }
        } catch (err) {
            res.json(err)
        }
    }

}