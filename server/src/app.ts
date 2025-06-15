import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import ticketRouter from "./routes/ticketRoutes"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/tickets", ticketRouter);

export default app;