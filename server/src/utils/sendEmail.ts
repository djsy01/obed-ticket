import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER!;
const EMAIL_PASS = process.env.EMAIL_PASS!;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

export const sendTicketEmail = async (
  to: string,
  name: string,
  qrUrl: string
) => {
  const mailOptions = {
    from: `"OBED 예배팀" <${EMAIL_USER}>`,
    to,
    subject: "[OBED] 예매 완료 – QR 티켓 안내",
    html: `
      <h3>🎫 ${name}님, 티켓이 확인되었습니다.</h3>
      <p>아래 QR 코드를 행사 당일 입장 시 보여주세요.</p>
      <img src="${qrUrl}" alt="QR Code" style="width:200px;" />
      <p>또는 다음 링크를 클릭해 입장을 확인할 수 있습니다:</p>
      <a href="https://obed-ticket.vercel.app/verify/${encodeURIComponent(
        name
      )}">티켓 확인하러 가기</a>
    `,
  };

  await transporter.sendMail(mailOptions);
};
