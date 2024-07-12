import { AccountController } from '@/controllers/account.controller';
import { Router } from 'express'
import { AdminController } from '@/controllers/admin.controller';
import { verifyToken } from '@/middlewares/account.middleware';

export class AdminRouter {
    private router: Router
    private adminController: AdminController
    private accountController: AccountController

    constructor() {
        this.accountController = new AccountController()
        this.adminController = new AdminController()
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        this.router.post('/', this.adminController.createAdmin);
        this.router.post('/setup-verify-admin', verifyToken, this.adminController.setupAdmin, this.accountController.verifyAdmin);
        this.router.get('/', this.adminController.getAdmins);
        this.router.get('/availableAdmins', this.adminController.getAvaliableAdmins);
        this.router.get('/:id', this.adminController.getAdminById);
        this.router.patch('/re-verify-account', verifyToken, this.accountController.verifyAdmin);
        this.router.patch('/personal/:id', this.adminController.updatePersonalInfo);
        this.router.patch('/email/:id', this.adminController.editEmail)
        this.router.patch('/name/:id', this.adminController.editFullName)
        this.router.patch('/:id', this.adminController.updatePhoto);
        this.router.delete('/photo/:id', this.adminController.removePhoto);
        this.router.delete('/:id', this.adminController.dischargeAdmin);
    }

    getRouter() : Router{
        return this.router
    }
}