// server/src/utils/certificateGen.js
// Minimal placeholder — replace with real PDF/SVG generation (pdfkit, puppeteer, html-to-pdf)
const path = require('path');
const fs = require('fs');

async function generateCertificate({ eventId, userId }) {
  // In production, generate a PDF or image and upload to S3/GCS then return the URL.
  // For now, return a placeholder file URL or static path
  const placeholder = `${process.env.CLIENT_URL || 'http://localhost:3000'}/certificates/placeholder.pdf`;
  return placeholder;
}

module.exports = { generateCertificate };
