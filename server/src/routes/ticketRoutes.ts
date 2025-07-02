import { Router } from "express";
import {
  applyTicket,
  getTicketByNameAndPhone,
  requestConfirmTicket,
  requestRefundTicket,
  requestDeleteTicket,
  getAllTickets,
  confirmTicketByAdmin,
  confirmRefundByAdmin
} from "../controllers/ticketController";

const router = Router();

// ✅ 기본 API 테스트
router.get("/", (req, res) => {
  res.send("🎫 OBED Ticket API is working");
});

// ✅ 티켓 신청
router.post("/", applyTicket);

// ✅ 이름 + 전화번호 조회
router.get("/search", getTicketByNameAndPhone);

// ✅ 관리자: 입금 확인
router.patch("/:id/request-confirm", requestConfirmTicket);

// ✅ 사용자: 송금 완료 요청
router.patch("/:id/request-refund", requestRefundTicket);

// ✅ 사용자: 예약 취소
router.patch("/:id/request-delete", requestDeleteTicket);

// ✅ 관리자: 모든 티켓 조회
router.get("/all", getAllTickets);

// ✅ 관리자: 티켓 상태 확인 (입금 확인)
router.patch("/:id/confirm", confirmTicketByAdmin);

// ✅ 관리자: 환불 상태 확인
router.patch("/:id/confirm-refund", confirmRefundByAdmin);

export default router;
