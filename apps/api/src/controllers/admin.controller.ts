import { NextFunction, Request, Response } from "express";
import { serverResponse } from "@/helpers/apiResponse";
import prisma from "@/prisma";
import { sign } from "jsonwebtoken";
import { v4 as uuid } from 'uuid'
import path from 'path'
import fs from 'fs'
import { transporter } from "@/helpers/nodemailer";
import handlebars from "handlebars";
import { genSalt, hash } from "bcrypt";

export class AdminController {
    async createAdmin(req: Request, res: Response) {
        try { 
            const { email } = req.body;
            const existingUserEmail = await prisma.user.findUnique({ where: { email: email } })
            const existingAdminEmail = await prisma.admin.findUnique({ where: { email: email } })
    
            if (existingUserEmail || existingAdminEmail) {
                return serverResponse(res, 409, 'error', 'email has been taken', existingUserEmail || existingAdminEmail)
            } 
    
            const admin = await prisma.admin.create({
                data: { id: uuid(), ...req.body }
            })
    
            const payload = { id: admin.id, role: admin.role }
            const token = sign(payload, process.env.KEY_JWT!, { expiresIn: '1h' })
            const link = `${process.env.PUBLIC_URL}verify/admin/${token}`;
    
            const templatePath = path.join(__dirname, "../templates", "registerAdmin.html")
            const templateSource = fs.readFileSync(templatePath, 'utf-8')
            const compiledTemplate = handlebars.compile(templateSource)
            const html = compiledTemplate({ link })
    
            await transporter.sendMail({
                from: "weardrobe2000@gmail.com",
                to: admin.email,
                subject: "Welcome to WearDrobe! Verify Your Email to Get Started",
                html
            })
            
            serverResponse(res, 201, 'ok', 'user has been registered!', admin)
    
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async setupAdmin(req: Request, res: Response, next: NextFunction) {
        try { 

            const { fullName, password, dob, gender, account } = req.body;

            const salt = await genSalt(10);
            const hashedPassword = await hash(password, salt);

            const admin = await prisma.admin.update({
                where: { id: account.id },
                data : {
                    fullName, gender ,
                    password: hashedPassword,
                    dob: new Date(dob),
                }
            })
            next()
    
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getAdminById(req: Request, res: Response) {
        try {
            const admin = await prisma.admin.findFirst({ where: { id: req.params.id } })
            serverResponse(res, 200, 'ok', 'admin found!', admin)
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getAdmins(req: Request, res: Response) {
        try {
            const admins = await prisma.admin.findMany({
                where: { role: 'warAdm' },
                select: {
                    id: true,
                    accountActive: true,
                    fullName: true,
                    email: true,
                    gender: true,
                    dob: true,
                    createdAt: true
                }
            })
            serverResponse(res, 200, 'ok', 'admin found!', admins)
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async getAvaliableAdmins(req: Request, res: Response) {
        try {
            const availableAdmins = await prisma.admin.findMany({
                where: {
                    role: 'warAdm',
                    accountActive: true, 
                    Warehouse: null
                }
            });
            serverResponse(res, 200, 'ok', 'admins found!', availableAdmins)
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async editEmail(req: Request, res: Response) {
        try {
            const { email } = req.body
            const admin = await prisma.admin.findFirst({ where: { id: req.params.id }})
            if (!admin) return serverResponse(res, 404, 'error', 'account not found')
            const existingUserEmail = await prisma.user.findUnique({ where : { email: req.body.email }})
            const existingAdminEmail = await prisma.admin.findUnique({ where : { email: req.body.email }})
            if (existingAdminEmail || existingUserEmail) return serverResponse(res, 409, 'error', 'Email has been taken!')
            await prisma.admin.update({ where: { id: admin.id }, data: { accountActive: false } })
                    
            const payload = { id: admin.id, role: admin.role, newEmail: email,  }
            const token = sign(payload, process.env.KEY_JWT!, { expiresIn: '1h' })
            const link = `${process.env.PUBLIC_URL}verify/admin/${token}`;
    
            const templatePath = path.join(__dirname, "../templates", "reVerifyAccount.html")
            const templateSource = fs.readFileSync(templatePath, 'utf-8')
            const compiledTemplate = handlebars.compile(templateSource)
            const html = compiledTemplate({ link, name: admin?.fullName })
    
            await transporter.sendMail({
                from: "weardrobe2000@gmail.com",
                to: req.body.email,
                subject: "Action Required: Re-Verify Your WearDrobe Account Email",
                html
            })

            serverResponse(res, 200, 'ok', 'Verification email has been sent!')
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async editFullName(req: Request, res: Response) {
        try {
            const admin = await prisma.admin.findFirst({ where: { id: req.params.id }})
            if (!admin) return serverResponse(res, 404, 'error', 'account not found')
            await prisma.admin.update({ where: { id: admin.id }, data: { fullName: req.body.fullName } })
            serverResponse(res, 200, 'ok', 'Full name has been updated!')
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async dischargeAdmin(req: Request, res: Response) {
        try {
            const admin = await prisma.admin.findFirst({ where: { id: req.params.id }})
            if (!admin) return serverResponse(res, 404, 'error', 'account not found')
            await prisma.admin.delete({ where: { id: admin.id } })
            serverResponse(res, 200, 'ok', 'Admin has been discharged!')
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async updatePhoto(req: Request, res: Response) {
        try {
            const admin = await prisma.admin.findFirst({ where : { id: req.params.id }})
            if (admin) {
                await prisma.admin.update({ where: { id: admin.id }, data: { imgUrl: req.body.imgUrl  } })
            } else return serverResponse(res, 404, 'error', 'admin not found!')
            serverResponse(res, 200, 'ok', 'photo profile has been updated')
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async removePhoto(req: Request, res: Response) {
        try { 
            const admin = await prisma.admin.findFirst({ where : { id: req.params.id }})
            if (admin) {
                if (admin.imgUrl == null) return serverResponse(res, 400, 'error', 'You have no photo profile')
                await prisma.admin.update({ where: { id: admin.id }, data: { imgUrl: null  } })
            } else return serverResponse(res, 404, 'error', 'admin not found!')
            serverResponse(res, 200, 'ok', 'Photo profile has deleted!')
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }

    async updatePersonalInfo(req: Request, res: Response) {
        try { 
            const { email, prevEmail } = req.body

            const admin = await prisma.admin.findFirst({ where : { id: req.params.id }})
            if (email) {
                const existingUserEmail = await prisma.user.findUnique({ where : { email: email }})
                const existingAdminEmail = await prisma.admin.findUnique({ where : { email: email }})
                if (existingAdminEmail || existingUserEmail) return serverResponse(res, 409, 'error', 'Email has been taken!')
            }

            if (admin) {
                for (const [key, value] of Object.entries(req.body)) {
                    if (key != 'email' && key != 'prevEmail') {
                        await prisma.admin.update({ where: { id: admin.id }, data: {
                            [key]: value,
                        } })
                    }
                }
                if (email) {
                    await prisma.admin.update({ where: { id: admin.id }, data: { accountActive: false, } })
                    
                    const payload = { id: admin.id, role: admin.role, prevEmail: prevEmail, newEmail: email }
                    const token = sign(payload, process.env.KEY_JWT!, { expiresIn: '1h' })
                    const link = `${process.env.PUBLIC_URL}verify/admin/${token}`;
            
                    const templatePath = path.join(__dirname, "../templates", "reVerifyAccount.html")
                    const templateSource = fs.readFileSync(templatePath, 'utf-8')
                    const compiledTemplate = handlebars.compile(templateSource)
                    const html = compiledTemplate({ link, name: admin?.fullName })
            
                    await transporter.sendMail({
                        from: "weardrobe2000@gmail.com",
                        to: email,
                        subject: "Action Required: Re-Verify Your WearDrobe Account Email",
                        html
                    })
                } 
                
            } else return serverResponse(res, 404, 'error', 'Account not found!')

            serverResponse(res, 200, 'ok', 'Your personal info has been successfully updated!')
        } catch (error: any) {
            serverResponse(res, 400, 'error', error)
        }
    }
}