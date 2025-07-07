import { Request, Response } from "express";
import prisma from "../../prismaClient";
import jwt from "jsonwebtoken";

const secretKey = '4b88e72faee7a16a';

interface Body {
  name: string;
  email: string;
  password: string;
  type?: string;
}

interface UserExists {
  id: number;
}

export default async function register(req: Request, res: Response): Promise<any> {

  const body: Body = req.body;
  let { name, email, password } = body;

  if (!name || !email || !password) return res.status(400).json({ error: "Invalid credentials provided" });

  let newUser;

  try {
    let userExists: UserExists | null = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    // console.log(userExists);
    if (userExists) return res.status(400).json({ error: "User with email address already exists, login" });


    newUser = await prisma.user.create({
      data : {
        email: email.toLowerCase(),
        password,
        regular: {
          create: {
            name,
          }
        }
      },
      select: {
        id: true,
        email: true,
        regular: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    });

    const payload = { id: newUser.id };

    const token = jwt.sign(payload, secretKey, { expiresIn: '7h' });

    res.cookie('user', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 7 * 1000,
      sameSite : 'lax',
      secure: false,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "An error occured while trying to signup user" });
  }

  return res.status(201).json({
    message: "Signup successful",
    newUser,
  });
}

export async function createAdmin(req: Request, res: Response): Promise<any> {

  const body: Body = req.body;
  let { name, email, password } = body;

  if (!name || !email || !password) return res.status(400).json({ error: "Invalid credentials provided" });

  let newUser;

  try {
    let userExists: UserExists | null = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true },
    });

    // console.log(userExists);
    if (userExists) return res.status(400).json({ error: "User with email address already exists, login" });

    const user = {
      create: {
        email: email.toLowerCase(),
        password,
      },
    };

    newUser = await prisma.admin.create({
      data: {
        name,
        user
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          }
        }
      }
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "An error occured while trying to signup user" });
  }

  // console.log("New admin -",newUser);
  return res.status(201).json({
    message: "Admin created successfully",
    newUser,
  });
}
