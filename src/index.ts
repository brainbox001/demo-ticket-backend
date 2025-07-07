import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import indexRoutes from "./routers/index.routes";
import { verifyToken } from "./middlewares/authMiddleware";
import prisma from "./prismaClient";
import cors from "cors";

const app = express();
const port = 3001;

app.use(cors({
  origin: "https://demo-ticket-frontend.vercel.app",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(verifyToken);


app.get('/', async (req:Request, res:Response) : Promise<any> => {
  const id = req.userId;
  if (id) {
    const user = await prisma.user.findUnique({
      where : {id : id || 0},
      select : {
        id: true,
        email: true,
        admin: true,
        regular: true,
      }
    });
  
    if (user) return res.status(200).json(user);
  }
  const userAgent = req.headers["user-agent"];
  res.status(225).json({message : `welcome to ticket app, ${userAgent}`});
});

app.use('/api', indexRoutes);

app.use((err: any, req:Request, res:Response, next:NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
});
