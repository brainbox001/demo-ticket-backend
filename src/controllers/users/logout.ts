import { Request, Response } from "express";

export default async function logout(req:Request, res:Response) : Promise<any> {
    const cookies = req.cookies;
    if (cookies['user']){
        res.clearCookie('user', {
            httpOnly: true,
            maxAge: 60 * 60 * 7
        });
    };
    return res.status(200).json({message: 'Logout successful'});
};
