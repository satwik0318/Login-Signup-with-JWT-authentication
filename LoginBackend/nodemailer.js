require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error(" Mailer error:", error);
  } else {
    console.log("Mailtrap SMTP is ready to send test emails.");
  }
});

module.exports = transporter;
