import QRCode from "qrcode";

/**
 * QR 코드 이미지를 Base64 문자열로 생성
 * @param data QR 코드에 넣을 데이터 (예: ticketId, name 등)
 * @returns base64 인코딩된 이미지 URL
 */
export const generateQRCode = async (data: string): Promise<string> => {
  try {
    const qrImageUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: "H",
      type: "image/png",
      width: 300,
      margin: 2,
    });
    return qrImageUrl;
  } catch (error) {
    console.error("❌ QR 코드 생성 실패:", error);
    throw new Error("QR 코드 생성 중 오류 발생");
  }
};
