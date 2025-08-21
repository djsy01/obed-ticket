import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const listEvents = async () => {
  const res = await axios.get(`${BASE_URL}/api/events`);
  return res.data;
};