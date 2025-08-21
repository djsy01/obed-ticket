import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

interface ApplyTicketParams {
  name: string;
  email: string;
  phone: string;
  ticketType: "student" | "adult";
  quantity?: number;
  memo?: string;
}

interface ApplyTicketResponse {
  ticketId: number;
}

export const applyTicket = async (
  eventId: number,
  data: ApplyTicketParams
): Promise<ApplyTicketResponse> => {
  const res = await axios.post(`${BASE_URL}/api/events/${eventId}/tickets`, data);
  console.log("🔥 BASE_URL:", BASE_URL);
  return res.data;
};

// ✅ 모든 이벤트를 대상으로 티켓을 검색하는 함수로 수정
export const searchTicketByNamePhone = async (name: string, phone: string) => {
  const res = await axios.get(`${BASE_URL}/api/events/find`, {
    params: { name, phone },
  });
  return res.data;
};

// ✅ 송금 요청 API (status: 'refund_confirm') - eventId 파라미터 추가
export const requestConfirm = async (eventId: number, ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/request-confirm`);
  return res.data;
};

// ✅ 환불 요청 API (status: 'refund_requested') - eventId 파라미터 추가
export const requestRefund = async (eventId: number, id: number, refundAccount: string) => {
  const res = await axios.patch(
    `${BASE_URL}/api/events/${eventId}/tickets/${id}/request-refund`,
    { refundAccount },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};

// ✅ 예약 취소 API (status: 'delete') - eventId 파라미터 추가
export const requestDelete = async (eventId: number, ticketId: number, refundAccount: string) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/request-delete`, {
    refundAccount,
  });
  return res.data;
};

// ✅ 관리자: 모든 티켓 조회 - eventId 파라미터 추가
export const getAllTickets = async (eventId: number) => {
  const res = await axios.get(`${BASE_URL}/api/events/${eventId}/tickets/all`);
  return res.data;
};

// ✅ 관리자: 티켓 상태 확인 (입금 확인) - eventId 파라미터 추가
export const requestConfirmByAdmin = async (eventId: number, ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/confirm`);
  return res.data;
};

// ✅ 관리자: 환불 상태 확인 - eventId 파라미터 추가
export const requestRefundConfirmByAdmin = async (eventId: number, ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/confirm-refund`);
  return res.data;
};

// ✅ QR 생성 + 이메일 발송 API - eventId 파라미터 추가
export const generateQRAndSendEmail = async (eventId: number, ticketId: number) => {
  const res = await axios.post(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/confirm-qr`);
  return res.data;
};

// ✅ QR 스캔 검증 - eventId 파라미터 추가
export const verifyTicket = async (eventId: number, id: string) => {
  const res = await axios.get(`${BASE_URL}/api/events/${eventId}/tickets/verify/${id}`);
  return res.data;
};