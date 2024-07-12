import { WishlistController } from '@/controllers/wishlist.controller'
import { Router } from 'express'

export class WishlistRouter {
    private router: Router
    private WishlistController: WishlistController

    constructor() {
        this.WishlistController = new WishlistController()
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', this.WishlistController.createWishlist)
        this.router.post('/get-wishlist', this.WishlistController.getWishlist)
        this.router.post('/total-likes', this.WishlistController.getTotalLikes)
        this.router.get('/:userId', this.WishlistController.getWishlistById)
    }

    getRouter() : Router{
        return this.router
    }
}