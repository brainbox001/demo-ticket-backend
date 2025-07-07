import express from "express";
import { createTicket, updateTicket, deleteTicket, getTickets } from "../controllers/tickets";
import { isAdmin } from "../middlewares/authMiddleware";

const  ticketRoutes = express.Router();

ticketRoutes.get('/', getTickets);
ticketRoutes.post('/create', createTicket);
ticketRoutes.delete('/delete/:id', deleteTicket);

ticketRoutes.use(isAdmin);

ticketRoutes.put('/update/:id', updateTicket);

export default ticketRoutes;
