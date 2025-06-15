import { Router } from "express";
import {
  applyTicket,
  getTicketStatus,
  confirmTicket,
} from "../controllers/ticketController";

const router = Router();

// 신청
router.post("/apply", applyTicket);

// 조회
router.get("/:id", getTicketStatus);

// 입금 확인 (관리자)
router.patch("/:id/confirm", confirmTicket);

export default router;
