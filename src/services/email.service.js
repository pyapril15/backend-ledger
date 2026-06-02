import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter using Gmail's SMTP server with OAuth2 authentication
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    type: "OAuth2",
    user: process.env.GOOGLE_EMAIL_USER,
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Error setting up email transporter:", error);
  } else {
    console.log("Email transporter is ready to send emails.");
  }
});

// Function to send an email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Backend Ledger" <${process.env.GOOGLE_EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log("Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Function to send registration email
async function sendRegistrationEmail(toEmail, name) {
  const subject = "Welcome to Backend Ledger!";
  const text = `Hi ${name},\n\nThank you for registering with Backend Ledger. We're excited to have you on board!\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>Thank you for registering with <strong>Backend Ledger</strong>. We're excited to have you on board!</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(toEmail, subject, text, html);
}

// Function to send debit transaction email
async function sendDebitTransactionEmail(toEmail, name, currency, amount, toAccount) {
  const subject = "Debit Transaction Alert from Backend Ledger";
  const text = `Hi ${name},\n\nYour transaction of ${currency}${amount} to account ${toAccount} was successfully processed.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>A transaction of <strong>${currency}${amount}</strong> to account <strong>${toAccount}</strong> was successfully processed.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(toEmail, subject, text, html);
}

// Function to send credit transaction email
async function sendCreditTransactionEmail(toEmail, name, currency, amount, fromAccount) {
  const subject = "Credit Transaction Alert from Backend Ledger";
  const text = `Hi ${name},\n\nYou have received a transaction of ${currency}${amount} from account ${fromAccount}.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>You have received a transaction of <strong>${currency}${amount}</strong> from account <strong>${fromAccount}</strong>.</p><p>Best regards,<br>The Backend Ledger Team</p>`;

  await sendEmail(toEmail, subject, text, html);
}

// Function to send transaction failure email
async function sendTransactionFailureEmail(toEmail, name, currency, amount, toAccount) {
  const subject = "Transaction Failure Alert from Backend Ledger";
  const text = `Hi ${name},\n\nWe regret to inform you that your transaction of ${currency}${amount} to account ${toAccount} has failed. Please check your account balance and try again.\n\nBest regards,\nThe Backend Ledger Team`;
  const html = `<p>Hi ${name},</p><p>We regret to inform you that your transaction of <strong>${currency}${amount}</strong> to account <strong>${toAccount}</strong> has failed. Please check your account balance and try again.</p><p>Best regards,<br>The Backend Ledger Team</p>`;
}

export default { sendRegistrationEmail, sendDebitTransactionEmail, sendCreditTransactionEmail, sendTransactionFailureEmail };
