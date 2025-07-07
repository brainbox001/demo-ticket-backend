import express from "express";
import { isAuthenticated } from "../middlewares/authMiddleware";
import userRoutes from "./user.routes";
import ticketRoutes from "./ticket.routes";
import categoriesRoutes from "./categories.routes";
import adminRoutes from "./admin.routes";

const indexRoutes = express.Router();

indexRoutes.use('/users', userRoutes);

indexRoutes.use(isAuthenticated);

indexRoutes.use('/tickets', ticketRoutes);
indexRoutes.use('/categories', categoriesRoutes);
indexRoutes.use('/admin', adminRoutes);

export default indexRoutes;
