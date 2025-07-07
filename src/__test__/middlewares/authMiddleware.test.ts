import { isAuthenticated } from "../../middlewares/authMiddleware";
import { Request, Response, NextFunction } from "express";
import prisma from "../../prismaClient";
import jwt from 'jsonwebtoken';

const prismaSpy = jest.spyOn(prisma.user, "findUnique") as jest.Mock;
const jwtSpy = jest.spyOn(jwt, "verify") as jest.Mock;

jwtSpy.mockReturnValue({ id: 1 } as any);
prismaSpy.mockResolvedValue({ id: 1 } as any);

afterAll(async () => {
    jest.clearAllMocks();
});

let req = {
    cookies: { user: "1" },
} as unknown as Request;
let res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
} as unknown as Response;

let next = jest.fn() as NextFunction;


test("isAuthenticated middleware --valid token", async () => {
    await isAuthenticated(req, res, next);

    expect(next).toHaveBeenCalled();
});

test("isAuthenticated middleware --no user cookie", async () => {
    req.cookies.user = undefined;
    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized request!!' });
});

test("isAuthenticated middleware --invalid token", async () => {
    jwtSpy.mockReturnValue(undefined);
    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized request!!' });
});

test("isAuthenticated middleware --user not found", async () => {
    prismaSpy.mockResolvedValue(null);
    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized request!!' });
});
