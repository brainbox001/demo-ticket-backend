import express from "express";
import register from "../controllers/users/register";
import login from "../controllers/users/login";
import logout from "../controllers/users/logout";

const userRoutes = express.Router();

userRoutes.post('/register', register);
userRoutes.post('/login', login);
userRoutes.post('/logout', logout);

export default userRoutes;
