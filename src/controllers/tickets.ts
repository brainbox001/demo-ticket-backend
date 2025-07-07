import { Request, Response } from "express";
import prisma from "../prismaClient";
import Joi from "joi";

const ticketSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    categoryId: Joi.number().required(),
    senderId: Joi.number().optional(),
    status: Joi.string().optional(),
    priority: Joi.string().optional(),
});

export async function getTickets(req: Request, res: Response): Promise<any> {

    try {
        const id = req.user?.admin?.id || req.user?.regular?.id;

        let where : {
            category?: { handlerId: number };
            senderId?: number;
        } = {
            senderId: parseInt(id as string) || 0
        };

        if (req.role == 'admin') {
            where = {
                category: { handlerId: parseInt(id as string) || 0 }
            }
        } 

        const tickets = await prisma.ticket.findMany({
            where,
            include: {
                category: {
                    include: {
                        handler: true,
                    }
                },
                sender: true,
            }
        });

        return res.status(200).json(tickets);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "An error occurred while fetching tickets" });
    }
}

export async function createTicket(req: Request, res: Response): Promise<any> {

    const { error, value } = ticketSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details?.[0]?.message || "Validation error" });

    const { title, description, categoryId, status, priority } = value;

    try {
        const senderId = req.user?.regular?.id;
        const categoryExists = await prisma.category.findUnique({
            where: { id: parseInt(categoryId) || 0 },
        });
        if (!categoryExists) return res.status(404).json({ error: "Category not found" });

        const senderExists = await prisma.regularUser.findUnique({
            where: { id: parseInt(senderId) || 0 },
        });
        if (!senderExists) return res.status(404).json({ error: "Sender not found" });

        const newTicket = await prisma.ticket.create({
            data: {
                title,
                description,
                status: status || "OPEN",
                priority: priority || "LOW",
                category: {
                    connect: { id: parseInt(categoryId) },
                },
                sender: {
                    connect: { id: parseInt(senderId) },
                },
            },
            include: {
                category: {
                    include: {
                        handler: true,
                    }
                },
                sender: true,
            }
        });

        return res.status(201).json(newTicket);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "An error occurred while creating the ticket" });
    }
}

export async function updateTicket(req: Request, res: Response): Promise<any> {

    const { id } = req.params;
    const { status } = req.body;

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id as string) || 0 },
        });

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        const updatedTicket = await prisma.ticket.update({
            where: { id: parseInt(id as string) || 0 },
            data: {
                status,
            },
            include: {
                category: true,
                sender: true,
            }
        });
        // console.log("Updated Ticket - ", updatedTicket);
        return res.status(200).json(updatedTicket);
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "An error occurred while updating the ticket" });
    }
}

export async function deleteTicket(req: Request, res: Response): Promise<any> {

    const { id } = req.params;

    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id as string) || 0 },
        });

        if (!ticket) return res.status(404).json({ error: "Ticket not found" });

        await prisma.ticket.delete({
            where: { id: parseInt(id as string) || 0 },
        });

        return res.status(200).json({ message: "Ticket deleted successfully" });
    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json({ error: "An error occurred while deleting the ticket" });
    }
}
