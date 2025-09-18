// server/src/utils/emailSender.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // or use SMTP details
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, html, text }) {
  const info = await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  });
  return info;
}

module.exports = { sendMail };
