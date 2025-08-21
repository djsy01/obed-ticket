import { Link } from "react-router-dom";
import "../styles/Header.css";

export default function Header() {
  return (
    <header className="header">
      <h1 className="header-title">🎫 OBED 티켓</h1>
      <nav className="nav">
        <Link to="/" className="nav-link">행사목록</Link>
        <Link to="/find" className="nav-link">예매 확인하기</Link>
      </nav>
    </header>
  );
}