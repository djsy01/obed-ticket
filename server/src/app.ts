import express from 'express';
import cors from "cors";
import ticketRoutes from './routes/ticketRoutes';

const app = express();
app.use(express.json());
app.use(cors());

// 예매 관련 라우터 연결
app.use("/api/tickets", ticketRoutes);

export default app;
