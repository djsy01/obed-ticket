import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const listEvents = async () => {
  const res = await axios.get(`${BASE_URL}/api/events`);
  return res.data;
};

// ✅ 파일 업로드를 위해 FormData를 인자로 받도록 수정
export const createEvent = async (data: FormData) => {
  const res = await axios.post(`${BASE_URL}/api/events`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};