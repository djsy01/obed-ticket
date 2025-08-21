import { Router } from "express";
import * as events from "../controllers/eventsController";
import ticketsRouter from "./ticketRoutes";
import { getTicketsForUser } from "../controllers/ticketController";

const router = Router();

// 행사 CRUD
router.get("/", events.listEvents);
router.post("/", events.createEvent);
router.get("/:id", events.getEvent);
router.put("/:id", events.updateEvent);
router.delete("/:id", events.deleteEvent);

// ✅ 이름 + 전화번호로 모든 행사 티켓 조회 (전역)
router.get("/find", getTicketsForUser);

// 행사 존재 확인 (선택, 안전)
router.use("/:id", events.ensureEventExists);

// ★ 여기서 행사 하위 티켓 라우트 마운트
router.use("/:id/tickets", ticketsRouter);

export default router;