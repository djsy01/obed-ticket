import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

type Ticket = {
  name: string;
  ticketType: "student" | "adult";
  quantity: number;
  createdAt: string;
};

export default function VerifyPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`/api/tickets/verify/${id}`);
        setTicket(res.data);
      } catch (err) {
        console.error("❌ verify error:", err);
        setError("❌ 유효하지 않은 티켓입니다.");
      }
    };

    if (id) fetchTicket();
  }, [id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? "날짜 없음" : date.toLocaleString("ko-KR");
  };

  return (
    <div className="verify-container" style={{ textAlign: "center", padding: "2rem" }}>
      <h2>🎫 OBED 티켓</h2>

      {error ? (
        <div style={{ color: "red", marginTop: "2rem" }}>{error}</div>
      ) : ticket ? (
        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "10px",
            padding: "1.5rem",
            maxWidth: "500px",
            margin: "2rem auto",
            fontSize: "1.1rem",
            backgroundColor: "#f9f9f9",
          }}
        >
          <p style={{ fontWeight: "bold", fontSize: "1.2rem", marginBottom: "1rem" }}>
            ✅ 유효한 티켓입니다
          </p>
          <p>👤 이름: {ticket.name || "-"}</p>
          <p>🎟️ 티켓 종류: {ticket.ticketType === "student" ? "학생" : "성인"}</p>
          <p>🧾 수량: {ticket.quantity}매</p>
          <p>🕓 신청일: {formatDate(ticket.createdAt)}</p>
        </div>
      ) : (
        <p>로딩 중...</p>
      )}
    </div>
  );
}
