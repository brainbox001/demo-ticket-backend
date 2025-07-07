import { Request, Response, NextFunction } from "express";
import prisma from "../prismaClient";
import jwt from 'jsonwebtoken';

declare global{
    namespace Express{
      interface Request{
        user: any;
        role?: string;
        userId?: number | null;
      }
    }
  }

const secretKey = '4b88e72faee7a16a';

export async function verifyToken(req:Request, res:Response, next:NextFunction) : Promise<any> {
    const cookies = req.cookies;
    const token = cookies.user;
    // console.log(token);
    req.userId = null;

    if (token) {
        try {
            const payload: any = jwt.verify(token, secretKey);
            if (payload && payload.id) req.userId = payload.id;
        } catch (error) {
            return res.status(400).json({error: 'Unauthorized request!!'});
        }
    }
    next();
}

export async function isAuthenticated(req:Request, res:Response, next:NextFunction) : Promise<any> {
  
    const id = req.userId;

    if(!id) return res.status(400).json({error: 'Unauthorized request!!'});
    
    const user = await prisma.user.findUnique({
        where: { id : id || 0 },
        select: { id: true, admin: true, regular: true }
    });

    // console.log(user);

    if(!user) return res.status(400).json({error: 'Unauthorized request!!'});

    req.user = user;
    req.role = user.admin ? 'admin' : 'regularUser';

    next();
};

export async function isSuperAdmin(req:Request, res:Response, next:NextFunction) : Promise<any> {
    const user = req.user;

    if(!user || !user.admin || !user.admin.isSuperAdmin) return res.status(400).json({error: 'Unauthorized request!!'});

    next();
};

export async function isAdmin(req:Request, res:Response, next:NextFunction) : Promise<any> {
    const user = req.user;

    if(!user || !user.admin) return res.status(400).json({error: 'Unauthorized request!!'});

    next();
};
