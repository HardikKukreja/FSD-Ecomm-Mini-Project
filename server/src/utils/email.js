import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  if (!transporter && process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
};

export const sendOrderConfirmation = async (order, user) => {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Order Confirmed — #${order._id}`,
      html: `<h2>Order Confirmed!</h2><p>Hi ${user.name}, your order #${order._id} has been placed successfully. Total: ₹${order.total}</p>`,
    });
  } catch (err) { console.error('Email error:', err.message); }
};

export const sendOrderStatusUpdate = async (order, user) => {
  const t = getTransporter();
  if (!t) return;
  try {
    await t.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: `Order #${order._id} — Status: ${order.orderStatus}`,
      html: `<h2>Order Update</h2><p>Hi ${user.name}, your order #${order._id} status changed to <strong>${order.orderStatus}</strong>.</p>`,
    });
  } catch (err) { console.error('Email error:', err.message); }
};

