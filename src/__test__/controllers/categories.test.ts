import { upsertCategory, getCategories } from "../../controllers/categories";
import prisma from "../../prismaClient";
import { Request, Response } from "express";


afterAll(async () => {
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
  jest.clearAllMocks();
});

beforeEach(async () => {
  jest.clearAllMocks();
});

let req = {
  body: { name: "billing" },
} as unknown as Request;

let res = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

test("Can create a category", async () => {
  let newUser = await prisma.admin.create({
    data: {
      name: "tester", 
      user: {
        create: {
          email: "test3@example.com",
      password: "securepassword",
        }
      }
      },
    select: { id: true }
  });

  req.body.handlerId = newUser?.id;

  await upsertCategory(req, res);
  expect(res.status).toHaveBeenCalledWith(201);
});

test("get all categories", async () => {
  await getCategories(req, res);
  expect(res.status).toHaveBeenCalledWith(200);
  expect(res.json).toHaveBeenCalled();
});