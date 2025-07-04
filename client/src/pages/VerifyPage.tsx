import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/VerifyPage.css";

type Ticket = {
  name: string;
  ticketType: string;
  quantity: number;
  createdAt: string;
};

export default function VerifyPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    axios
      .get(`/api/tickets/verify/${id}`)
      .then((res) => setTicket(res.data))
      .catch((err) => {
        if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError("❌ 알 수 없는 오류가 발생했습니다.");
        }
      });
  }, [id]);

  if (error) {
    return (
      <div className="verify-container">
        <h2>{error}</h2>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="verify-container">
        <p>⏳ 티켓 정보를 확인 중입니다...</p>
      </div>
    );
  }

  return (
    <div className="verify-container">
      <h2>✅ 유효한 티켓입니다</h2>
      <p>👤 이름: {ticket.name}</p>
      <p>🎟️ 티켓 종류: {ticket.ticketType === "student" ? "학생" : "성인"}</p>
      <p>🧾 수량: {ticket.quantity}매</p>
      <p>🕐 신청일: {new Date(ticket.createdAt).toLocaleString()}</p>
    </div>
  );
}
