import express from "express";
import { isSuperAdmin } from "../middlewares/authMiddleware";
import { createAdmin } from "../controllers/users/register";

const adminRoutes = express.Router();

adminRoutes.use(isSuperAdmin);

adminRoutes.post('/create', createAdmin);

export default adminRoutes;
