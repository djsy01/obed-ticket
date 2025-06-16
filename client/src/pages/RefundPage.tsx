import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestRefund } from "../api/ticket";
import "../styles/RefundPage.css";

const getTicketTypeLabel = (type: string) => {
  return type === "student" ? "학생" : "성인";
};

const formatQuantity = (qty: number) => `${qty}매`;

export default function RefundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<any>(null);
  const [accountInput, setAccountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!location.state) {
      alert("잘못된 접근입니다.");
      navigate("/");
      return;
    }

    const incomingTicket = location.state;
    console.log("📦 전달된 ticket 정보:", JSON.stringify(incomingTicket, null, 2));
    setTicket(incomingTicket);
  }, [location.state, navigate]);

  const handleRefundSubmit = async () => {
    if (!accountInput.trim()) {
      alert("환불 계좌를 입력해주세요.");
      return;
    }

    if (!ticket || !ticket.ticketId) {
      alert("티켓 정보가 올바르지 않습니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestRefund(ticket.ticketId, accountInput); // ✅ ticket.ticketId 사용
      alert("환불 요청이 완료되었습니다.");
      navigate("/");
    } catch (err) {
      console.error("환불 요청 실패:", err);
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket) return null;

  return (
    <div className="refund-container">
      <h2>💸 환불 요청</h2>
      <p><strong>예매자:</strong> {ticket.name}</p>
      <p><strong>전화번호:</strong> {ticket.phone}</p>
      <p><strong>티켓 종류:</strong> {getTicketTypeLabel(ticket.ticketType)}</p>
      <p><strong>수량:</strong> {formatQuantity(ticket.quantity)}</p>

      <label>📥 환불 계좌</label>
      <input
        className="refund-input"
        value={accountInput}
        onChange={(e) => setAccountInput(e.target.value)}
        placeholder="은행명 + 계좌번호 (예: 카카오 3333-00-0000000)"
      />

      <button
        className="refund-button"
        onClick={handleRefundSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? "요청 중..." : "환불 요청"}
      </button>
    </div>
  );
}
