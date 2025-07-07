import { createTicket, updateTicket, deleteTicket } from "../../controllers/tickets";
import prisma from "../../prismaClient";
import { Request, Response } from "express";

let adminUser: { id: number } | null = null;
let regularUser: { id: number } | null = null;
let newCategory: { id: number } | null = null;
let ticket: { id: number } | null = null;

beforeAll(async () => {
    adminUser = await prisma.admin.create({
        data: {
            name: "adminTester",
            user: {
                create: {
                    email: "test5@example.com",
                    password: "securepassword",
                }
            }
        },
        select: { id: true }
    });

    regularUser = await prisma.regularUser.create({
        data: {
            name: "tester 2",
            user: {
                create: {
                    email: "test4@example.com",
                    password: "securepassword",
                }
            }
        },
        select: { id: true }
    });

    newCategory = await prisma.category.create({
        data: {
            name: "Technical Support",
            handler: {
                connect: { id: adminUser.id }
            }
        },
        select: { id: true }
    });
    
});

afterEach(async () => {
    jest.clearAllMocks();
});

afterAll(async () => {
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
});

let req = {
    body: { title: "Test Ticket", description: "This is a test ticket"},
    query : { handlerId: 0 }
} as unknown as Request;

let res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
} as unknown as Response;

test("Can create a ticket", async () => {

    req.body.senderId = regularUser?.id;
    req.body.categoryId = newCategory?.id;
    req.query.handlerId = adminUser?.id?.toString();

    await createTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
});

test("can update ticket", async () => {
    ticket = await prisma.ticket.create({
        data: {
            title: "Update Test Ticket",
            description: "This is a test ticket for update",
            status: "OPEN",
            priority: "LOW",
            category: {
                connect: { id: newCategory?.id }
            },
            sender: {
                connect: { id: regularUser?.id }
            }
        },
        select: { id: true }
    });
    req.params = { id: ticket.id.toString() };
    req.body.status = "RESOLVED";
    req.body.priority = "HIGH";

    await updateTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    // There's a console.log in the updateTicket function, so we can check if it was called
});

test("can delete ticket", async () => {
    if (!ticket) {
        throw new Error("Ticket is null");
    }
    req.params = { id: ticket.id.toString() };
    await deleteTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Ticket deleted successfully" });
});

test("check category not found", async () => {
    req.body.categoryId = 9999;
    await createTicket(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Category not found" });
});
