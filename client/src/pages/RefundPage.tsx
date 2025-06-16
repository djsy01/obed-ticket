import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { requestRefund } from "../api/ticket";
import "../styles/RefundPage.css";

const getTicketTypeLabel = (type: string) => {
  return type === "student" ? "학생" : "성인";
};

const formatQuantity = (qty: number) => `${qty}매`;

export default function RefundPage() {
  const location = useLocation();
  const ticket = location.state;
  const navigate = useNavigate();

  const [accountInput, setAccountInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!ticket) return <p>잘못된 접근입니다.</p>;

  const handleRefundSubmit = async () => {
    if (!accountInput.trim()) {
      alert("환불 계좌를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestRefund(ticket.id, accountInput);
      alert("환불 요청이 완료되었습니다.");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("요청 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="refund-container">
      <h2>💸 환불 요청</h2>
      <p><strong>예매자:</strong> {ticket.name}</p>
      <p><strong>전화번호:</strong> {ticket.phone}</p>
      <p><strong>티켓 종류:</strong> {getTicketTypeLabel(ticket.ticket_type)}</p>
      <p><strong>수량:</strong> {formatQuantity(ticket.quantity)}</p>

      <label>📥 환불 계좌</label>
      <input
        className="refund-input"
        value={accountInput}
        onChange={(e) => setAccountInput(e.target.value)}
        placeholder="은행명 + 계좌번호 (예: 카카오 3333-00-0000000)"
      />

      <button className="refund-button" onClick={handleRefundSubmit} disabled={isSubmitting}>
        {isSubmitting ? "요청 중..." : "환불 요청"}
      </button>
    </div>
  );
}
