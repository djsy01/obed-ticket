import { useEffect, useState } from "react";
import {
  getAllTickets,
  requestConfirmByAdmin,
  requestRefundConfirmByAdmin,
} from "../api/ticket";
import "../styles/AdminPage.css";
import { useNavigate, useLocation } from "react-router-dom";

const getStatusLabel = (status: string) => {
  switch (status) {
    case "pending":
      return "💰 입금 대기";
    case "requested":
      return "⌛ 입금 확인 중";
    case "confirmed":
      return "✅ 입금 완료";
    case "refund_requested":
      return "💸 환불 요청됨";
    case "cancelled":
      return "❌ 취소됨";
    case "refunded":
      return "💸 환불 완료";
    default:
      return status;
  }
};

export default function AdminPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filter, setFilter] = useState("all");

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 관리자 접근 제한: 쿼리스트링 key 검사
  useEffect(() => {
    const secret = import.meta.env.VITE_ADMIN_SECRET;
    const queryKey = new URLSearchParams(location.search).get("key");

    if (!secret || queryKey !== secret) {
      alert("접근 권한이 없습니다.");
      navigate("/");
    }
  }, [location.search, navigate]);

  useEffect(() => {
    getAllTickets()
      .then((data) => {
        setTickets(data);
      })
      .catch(() => alert("티켓 조회 실패"))
      .finally(() => setLoading(false));
  }, []);

  const handleConfirm = async (id: number) => {
    await requestConfirmByAdmin(id);
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "confirmed" } : t))
    );
  };

  const handleRefund = async (id: number) => {
    await requestRefundConfirmByAdmin(id);
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "refunded" } : t))
    );
  };

  const filteredTickets = tickets.filter((ticket) => {
    const keywordMatch =
      ticket.name.includes(searchText) || ticket.phone.includes(searchText);
    const filterMatch = filter === "all" || ticket.status === filter;
    return keywordMatch && filterMatch;
  });

  if (loading) return <p>로딩 중...</p>;

  return (
    <div className="admin-container">
      <h2>🎫 관리자 페이지</h2>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          type="text"
          placeholder="이름 또는 전화번호 검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">전체</option>
          <option value="pending">입금 대기</option>
          <option value="requested">입금 확인 중</option>
          <option value="confirmed">입금 완료</option>
          <option value="refund_requested">환불 요청됨</option>
          <option value="cancelled">취소됨</option>
          <option value="refunded">환불 완료</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>전화번호</th>
            <th>티켓 종류</th>
            <th>수량</th>
            <th>상태</th>
            <th>환불 계좌</th>
            <th>요청일</th>
            <th>액션</th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.name}</td>
              <td>{t.phone}</td>
              <td>{t.ticket_type === "student" ? "학생" : "성인"}</td>
              <td>{t.quantity}</td>
              <td>{getStatusLabel(t.status)}</td>
              <td>{t.refund_account || "-"}</td>
              <td>{new Date(t.created_at).toLocaleString()}</td>
              <td>
                {t.status === "requested" && (
                  <button onClick={() => handleConfirm(t.id)}>입금 완료</button>
                )}
                {t.status === "refund_requested" && (
                  <button onClick={() => handleRefund(t.id)}>환불 완료</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
