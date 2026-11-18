import { v4 as uuidv4 } from 'uuid';

export const createPaymentIntent = async (req, res) => {
  res.json({ success: true, paymentId: uuidv4(), message: 'Mock payment successful' });
};

