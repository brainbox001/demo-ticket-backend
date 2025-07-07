import express from "express";
import { isSuperAdmin } from "../middlewares/authMiddleware";
import { upsertCategory, deleteCategory, getCategories } from "../controllers/categories";

const categoriesRoutes = express.Router();

categoriesRoutes.get('/', getCategories);

categoriesRoutes.use(isSuperAdmin);

categoriesRoutes.post('/create', upsertCategory);
categoriesRoutes.delete('/delete/:id', deleteCategory);

export default categoriesRoutes;
