import register, { createAdmin } from "../../controllers/users/register";
import prisma from "../../prismaClient";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSpy = jest.spyOn(jwt, "sign") as jest.Mock;
jwtSpy.mockReturnValue("quwerhtht.dffjgjgjgjfbsbd");

afterAll(async () => {
  await prisma.user.deleteMany({});
});

beforeEach(async () => {
  jest.clearAllMocks();
});

let req = {
  body: { name: 'tester', email: "test@example.com", password: "securepassword" },
} as unknown as Request;

let res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  cookie: jest.fn(),
} as unknown as Response;

test("Can create an admin", async () => {
    const result = await createAdmin(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
});

test("Can register a regular user", async () => {
    req.body.email = "regular@test.com";
    const result = await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.cookie).toHaveBeenCalled();
});

test("Can detect duplicate email", async () => { 
    const result = await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "User with email address already exists, login" });
});
