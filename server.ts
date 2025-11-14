import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/workorder/send', async (req, res) => {
  try {
    const { customerInfo, serviceDetails, trackingId } = req.body;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: 'landonsmailboxes@gmail.com',
      subject: `Work Order: ${serviceDetails.type} - ${customerInfo.name} [${trackingId}]`,
      html: `<h1>${serviceDetails.type}</h1><p>Name: ${customerInfo.name}</p><p>Phone: ${customerInfo.phone}</p><p>Email: ${customerInfo.email}</p><p>Address: ${customerInfo.address}</p>`,
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: customerInfo.email,
      subject: `Order Confirmed - ${trackingId}`,
      html: `<h1>Thank you!</h1><p>Tracking ID: ${trackingId}</p>`,
    });

    res.json({ success: true, trackingId });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});