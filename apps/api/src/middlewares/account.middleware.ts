import { serverResponse } from "@/helpers/apiResponse";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = req.headers.authorization?.replace('Bearer ', '')
        if (!token) throw new Error("Token not found!");
        
        let verifiedAccount = verify(token, process.env.KEY_JWT!)
        req.body.account = verifiedAccount;  
        
        next()
    } catch (error: any) {
        serverResponse(res, 400, 'error', error)
    }
}