import { Router } from "express";
import {
  applyTicket,
  getTicketByNameAndPhone,
  confirmTicket,
} from "../controllers/ticketController";

const router = Router();

// 신청
router.post("/", applyTicket);

// 이름 + 전화번호 조회
router.get("/search", getTicketByNameAndPhone);

// 입금 확인 (관리자)
router.patch("/:id/confirm", confirmTicket);

export default router;
