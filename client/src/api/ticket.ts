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
  data: ApplyTicketParams
): Promise<ApplyTicketResponse> => {
  const res = await axios.post(`${BASE_URL}/api/tickets`, data);
  console.log("🔥 BASE_URL:", BASE_URL);
  return res.data;
};

export const getTicketStatus = async (id: string) => {
  const res = await axios.get(`${BASE_URL}/api/tickets/${id}`);
  return res.data;
};

export const searchTicketByNamePhone = async (name: string, phone: string) => {
  const res = await axios.get(`${BASE_URL}/api/tickets/search`, {
    params: { name, phone },
  });
  return res.data;
};

// ✅ 송금 요청 API (status: 'refund_confirm')
export const requestConfirm = async (ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/tickets/${ticketId}/request-confirm`);
  return res.data;
};

// ✅ 환불 요청 API (status: 'refund_requested')
export const requestRefund = async (id: number, refundAccount: string) => {
  const res = await axios.patch(
    `${BASE_URL}/api/tickets/${id}/request-refund`,
    { refundAccount },
    {
      headers: {
        "Content-Type": "application/json", // ✅ 명시적으로 선언!
      },
    }
  );

  return res.data;
};

// ✅ 예약 취소 API (status: 'delete')
export const requestDelete = async (ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/tickets/${ticketId}/request-delete`);
  return res.data;
};