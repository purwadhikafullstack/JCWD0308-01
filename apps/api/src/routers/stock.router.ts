import { StockController } from '@/controllers/stock.controller';
import {Router} from 'express'

export class StockRouter {
    private router: Router
    private stockController: StockController

    constructor() {
        this.stockController = new StockController()
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', this.stockController.createStock)
    }

    getRouter() : Router{
        return this.router
    }
}