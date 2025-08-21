// client/src/api/event.ts
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const listEvents = async () => {
  const res = await axios.get(`${BASE_URL}/api/events`);
  return res.data;
};

// ✅ createEvent 함수를 추가합니다.
export const createEvent = async (data: {
  title: string;
  date: string;
  location: string;
  description: string;
}) => {
  const res = await axios.post(`${BASE_URL}/api/events`, data);
  return res.data;
};