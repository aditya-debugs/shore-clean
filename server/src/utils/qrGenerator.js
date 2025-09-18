// server/src/utils/qrGenerator.js
const QRCode = require('qrcode');

async function generateQr(data) {
  // returns data URL for QR
  return await QRCode.toDataURL(data);
}

module.exports = { generateQr };
