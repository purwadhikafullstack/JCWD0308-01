import { Request, Response } from 'express';
import prisma from '@/prisma';
import { serverResponse } from '@/helpers/apiResponse';

export class WishlistController {
    async createWishlist(req: Request, res: Response) {
        try {
            const user = await prisma.user.findFirst({ where: { id: req.body.userId } })
            const product = await prisma.product.findFirst({ where: { id: req.body.productId } })
            if (!product) return serverResponse(res, 404, 'error', 'Product not found')
            if (!user) return serverResponse(res, 404, 'error', 'User not found')
            const existingWishlist = await prisma.wishList.findFirst({ where: { userId: user.id, productId: product.id } });

            if (existingWishlist) {
                await prisma.wishList.delete({ where: { id: existingWishlist.id } })
                return serverResponse(res, 200, 'ok', `${ product?.name } has been removed from your wishlist!`)
            } 

            const newWistlist = await prisma.wishList.create({ data: { productId: product.id, userId: user.id } })
            serverResponse(res, 200, 'ok', `${ product?.name } has been added to your wishlist!`, newWistlist)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async getWishlist(req:Request, res: Response) {
        try {
            const { userId, productId } = req.body
            const wishlist = await prisma.wishList.findFirst({ where: {
                userId, productId
            } });
            if (!wishlist) return serverResponse(res, 400, 'error', 'item on wishlist not found')
            serverResponse(res, 200, 'ok', `wishlist found!`, wishlist)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async getTotalLikes(req:Request, res: Response) {
        try {
            const { productId } = req.body;
            const likes = await prisma.wishList.findMany({ where: { productId: productId } });
            if (!likes) return serverResponse(res, 400, 'error', 'wishlist total likes not found')
            serverResponse(res, 200, 'ok', `wishlists found!`, likes)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

    async getWishlistById(req:Request, res: Response) {
        try {
            const { userId }  = req.params
            const wishlist = await prisma.wishList.findMany({ where: { userId } });
            if (!wishlist) return serverResponse(res, 400, 'error', 'wishlist is empty')
            
                type IProduct = NonNullable<Awaited<ReturnType<typeof prisma.product.findFirst>>>;
                let items: IProduct[] = [];
                for (const wish of wishlist) {
                    const item = await prisma.product.findFirst({ where: { id: wish.productId } });
                    if (item) items.push(item);
                }

            serverResponse(res, 200, 'ok', `wishlists found!`, items)
        } catch (error: any) {
            return serverResponse(res, 400, 'error', error)
        }
    }

}
 