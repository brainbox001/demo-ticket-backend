import { Request, Response } from "express";
import prisma from "../../prismaClient";
import jwt from "jsonwebtoken";

const secretKey = '4b88e72faee7a16a';

type User = {
    id: number;
    email: string;
    password?: string;
    admin: any;
    regular: any;
};

export default async function login(req: Request, res: Response): Promise<any> {
    const body = req.body;
    const { email, password } = body;
    if (!email || !password) return res.status(400).json({ error: 'Invalid credentials provided' });
    let user : User | null = null;
    try {
        user = await prisma.user.findFirst({
            where: { email: email.toLowerCase() },
            select: {
                id: true,
                email: true,
                password: true,
                admin: true,
                regular: true,
            }
        });

        // console.log("Logged in User -", user);

        if (!user) return res.status(400).json({ error: 'No user was attached to this email address' });

        if (password !== user.password) return res.status(400).json({ error: 'Incorrect email or password' });

        const payload = { id: user.id };

        const token = jwt.sign(payload, secretKey, { expiresIn: '7h' });

        res.cookie('user', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 7 * 1000,
            sameSite : 'none',
            secure : true,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'An error occured while trying to login user' });
    };

    delete user.password;

    return res.status(200).json({
        message: "Login successful",
        user,
    });
};
