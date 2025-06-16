import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/FindTicket.css";

export default function FindTicket() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.get(
        `/api/tickets/search?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`
      );

      if (res.data && res.data.ticket) {
        // ✅ 검색 성공 시 CompletePage로 이동 (쿼리 전달)
        navigate(`/complete?name=${encodeURIComponent(name)}&phone=${encodeURIComponent(phone)}`);
      } else {
        setError("예매 정보를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error(err);
      setError("검색 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="find-container">
      <h2>🔍 예매 조회</h2>
      <form onSubmit={handleSubmit}>
        <label>이름</label>
        <input value={name} onChange={(e) => setName(e.target.value)} required />

        <label>전화번호</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} required />

        <button type="submit">조회하기</button>

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </form>
    </div>
  );
}
