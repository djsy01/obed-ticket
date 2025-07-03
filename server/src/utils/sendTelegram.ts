import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const sendTelegram = async (message: string) => {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error("❌ 텔레그램 설정이 누락됨");
    return;
  }

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: message,
      parse_mode: "Markdown",
    });
    console.log("✅ 텔레그램 전송 성공");
  } catch (error) {
    console.error("❌ 텔레그램 전송 실패:", error);
  }
};
