import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TicketForm from "./pages/TicketForm";
import TicketStatus from "./pages/TicketStatus";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TicketForm />} />
        <Route path="/status" element={<TicketStatus />} />
      </Routes>
    </Router>
  );
}
