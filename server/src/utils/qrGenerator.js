import QRCode from "qrcode";

export const generateQR = async (data) => {
  try {
    // data can be JSON or simple string
    const qrString = JSON.stringify(data);
    return await QRCode.toDataURL(qrString); // returns Base64 string
  } catch (error) {
    throw new Error("QR generation failed");
  }
};
