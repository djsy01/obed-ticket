import { Router } from "express";
import {
  applyTicket,
  getTicketByNameAndPhone,
  requestConfirmTicket,
  requestRefundTicket,
  requestDeleteTicket,
  getAllTickets,
  confirmTicketByAdmin,
  confirmRefundByAdmin,
  confirmTicketWithQR,
  verifyTicket,
} from "../controllers/ticketController";

// ★ 상위 라우터의 :id(eventId)를 받으려면 꼭 필요
const router = Router({ mergeParams: true });

/**
 * 최종 경로는 모두 /api/events/:id/tickets 기준이 됩니다.
 * 예) POST /api/events/1/tickets           -> applyTicket
 *     GET  /api/events/1/tickets/search    -> getTicketByNameAndPhone
 *     PATCH /api/events/1/tickets/123/...  -> ticketId=123
 */

// 간단 헬스체크 (선택)
router.get("/", (_req, res) => {
  res.send("🎫 Event-scoped Tickets API is working");
});

// ✅ 티켓 신청 (이벤트 하위)
router.post("/", applyTicket);

// ✅ 이름 + 전화번호 조회 (유저용, 이벤트 하위)
router.get("/search", getTicketByNameAndPhone);

// ✅ 관리자/목록: 행사별 전체 티켓 조회
router.get("/all", getAllTickets);

// ✅ 사용자: 송금 확인 요청(=requested)
router.patch("/:ticketId/request-confirm", requestConfirmTicket);

// ✅ 사용자: 환불 요청
router.patch("/:ticketId/request-refund", requestRefundTicket);

// ✅ 사용자: 예약 취소
router.patch("/:ticketId/request-delete", requestDeleteTicket);

// ✅ 관리자: 입금 확정
router.patch("/:ticketId/confirm", confirmTicketByAdmin);

// ✅ 관리자: 환불 완료 확정
router.patch("/:ticketId/confirm-refund", confirmRefundByAdmin);

// ✅ QR 생성 및 메일 전송
router.post("/:ticketId/confirm-qr", confirmTicketWithQR);

// ✅ QR 스캔 검증
router.get("/:ticketId/verify", verifyTicket);

export default router;
