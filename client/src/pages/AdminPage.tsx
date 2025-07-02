import { useEffect, useState } from "react";
import { requestConfirmByAdmin, requestRefundConfirmByAdmin, getAllTickets } from "../api/ticket";
import "../styles/AdminPage.css"; // 선택적으로 스타일 작성 가능

interface Ticket {
  id: number;
  name: string;
  phone: string;
  ticket_type: string;
  status: string;
  created_at: string;
  quantity: number;
  refund_account?: string;
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    try {
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      alert("티켓 불러오기 실패");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleConfirmClick = async (ticketId: number) => {
    try {
      await requestConfirmByAdmin(ticketId);
      fetchTickets();
    } catch (err) {
      alert("입금 확인 실패");
      console.error(err);
    }
  };

  const handleRefundConfirmClick = async (ticketId: number) => {
    try {
      await requestRefundConfirmByAdmin(ticketId);
      fetchTickets();
    } catch (err) {
      alert("환불 처리 실패");
      console.error(err);
    }
  };

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="admin-container">
      <h2>🎫 전체 티켓 현황</h2>
      <table>
        <thead>
          <tr>
            <th>이름</th>
            <th>전화</th>
            <th>종류</th>
            <th>수량</th>
            <th>상태</th>
            <th>시간</th>
            <th>확인</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.phone}</td>
              <td>{t.ticket_type}</td>
              <td>{t.quantity}</td>
              <td>{t.status}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
              <td>
                {t.status === "requested" && (
                  <button onClick={() => handleConfirmClick(t.id)}>입금 확인</button>
                )}
                {t.status === "refund_requested" && (
                  <button onClick={() => handleRefundConfirmClick(t.id)}>환불 처리</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
