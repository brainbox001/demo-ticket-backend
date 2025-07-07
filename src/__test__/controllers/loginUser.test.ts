import login from "../../controllers/users/login";
import prisma from "../../prismaClient";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSpy = jest.spyOn(jwt, "sign") as jest.Mock;
jwtSpy.mockReturnValue("quwerhtht.dffjgjgjgjfbsbd");

afterAll(async () => {
  await prisma.user.deleteMany({});
});

beforeAll(async () => {
  await prisma.user.create({
    data: {
        email: "test2@example.com",
        password: "securepassword",
        admin : {
            create: {
                name: "tester"
            }
        }
    }
    });
});

beforeEach(async () => {
  jest.clearAllMocks();
});

let req = {
  body: { email: "test2@example.com", password: "securepassword" },
} as unknown as Request;

let res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  cookie: jest.fn(),
} as unknown as Response;

test("Can login successfully", async () => {
    const result = await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.cookie).toHaveBeenCalled();
});

test("Can detect invalid credentials", async () => {
    req.body.password = "wrongpassword";
    const result = await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Incorrect email or password' });
});
