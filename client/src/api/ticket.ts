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

export const getTicketStatus = async (eventId: number, id: string) => {
  const res = await axios.get(`${BASE_URL}/api/events/${eventId}/tickets/${id}`);
  return res.data;
};

export const searchTicketByNamePhone = async (eventId: number, name: string, phone: string) => {
  const res = await axios.get(`${BASE_URL}/api/events/${eventId}/tickets/search`, {
    params: { name, phone },
  });
  return res.data;
};

export const requestConfirm = async (eventId: number, ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/request-confirm`);
  return res.data;
};

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

export const requestDelete = async (eventId: number, ticketId: number, refundAccount: string) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/request-delete`, {
    refundAccount,
  });
  return res.data;
};

export const getAllTickets = async (eventId: number) => {
  const res = await axios.get(`${BASE_URL}/api/events/${eventId}/tickets/all`);
  return res.data;
};

export const requestConfirmByAdmin = async (eventId: number, ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/confirm`);
  return res.data;
};

export const requestRefundConfirmByAdmin = async (eventId: number, ticketId: number) => {
  const res = await axios.patch(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/confirm-refund`);
  return res.data;
};

export const generateQRAndSendEmail = async (eventId: number, ticketId: number) => {
  const res = await axios.post(`${BASE_URL}/api/events/${eventId}/tickets/${ticketId}/confirm-qr`);
  return res.data;
};

export const verifyTicket = async (eventId: number, id: string) => {
  const res = await axios.get(`${BASE_URL}/api/events/${eventId}/tickets/verify/${id}`);
  return res.data;
};