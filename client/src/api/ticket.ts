// src/api/ticket.ts
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
