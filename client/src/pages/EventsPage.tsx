import { useEffect, useState } from "react";
import { listEvents } from "../api/event";
import { Link } from "react-router-dom";
import "../styles/EventsPage.css";

const BASE_URL = import.meta.env.VITE_API_URL; // ✅ 백엔드 URL 가져오기

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listEvents()
      .then((data) => {
        setEvents(data);
      })
      .catch((err) => {
        console.error("❌ 행사 목록 조회 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="events-container">행사 목록을 불러오는 중...</div>;
  if (events.length === 0) return <div className="events-container">등록된 행사가 없습니다.</div>;

  return (
    <div className="events-container">
      <h2>진행 중인 행사</h2>
      <ul className="events-list">
        {events.map((event: any) => (
          <li key={event.id} className="events-list-item">
            {event.poster_url && (
              // ✅ 백엔드 URL을 붙여서 이미지 경로를 수정
              <img
                src={`${BASE_URL}${event.poster_url}`}
                alt={`${event.title} 포스터`}
                className="event-poster"
              />
            )}
            <h3>{event.title}</h3>
            <p>날짜: {new Date(event.date).toLocaleDateString()}</p>
            <p>장소: {event.location}</p>
            <div className="event-links">
              <Link to={`/events/${event.id}/apply`} className="event-link">티켓 신청하기</Link>
              <Link to={`/events/${event.id}/find`} className="event-link">예매 확인하기</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}