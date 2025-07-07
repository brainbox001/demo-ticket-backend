import prisma from "../prismaClient";
import { Request, Response } from "express";

export async function getCategories(req: Request, res: Response): Promise<any> {
    try {
        const categories = await prisma.category.findMany({});

        return res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while fetching categories' });
    }
}

export async function upsertCategory(req: Request, res: Response): Promise<any> {
    const { name, handlerId } = req.body;

    // console.log("Request body - ", req.body);

    if (!name || !handlerId) return res.status(400).json({ error: 'Category name and handler Id required' });

    try {

        const handlerExists = await prisma.admin.findUnique({
            where: { id: parseInt(handlerId) || 0 },
            select: { id: true }
        });

        // console.log("Handler exists - ",handlerExists);

        if (!handlerExists) return res.status(404).json({ error: 'This admin might have been removed by you' });

        const newCategory = await prisma.category.upsert({
            where: { name: name.toLowerCase() },
            update: {
                handler: {
                    connect: { id: parseInt(handlerId) }
                }
            },
            create: {
                name : name.toLowerCase(),
                handler: {
                    connect: { id: parseInt(handlerId) }
                }
            }
        })
        // console.log(newCategory);
        return res.status(201).json(newCategory);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while creating the category' });
    }
}

export async function deleteCategory(req: Request, res: Response): Promise<any> {
    const { id } = req.params;

    try {
        const category = await prisma.category.findUnique({ where: { id: parseInt(id as string) || 0 } });

        if (!category) return res.status(404).json({ error: 'Category not found' });

        await prisma.category.delete({ where: { id: parseInt(id as string) } });

        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'An error occurred while deleting the category' });
    }
}
