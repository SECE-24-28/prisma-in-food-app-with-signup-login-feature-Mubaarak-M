const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware');
const crypto = require('crypto');

// Process payment
router.post('/', auth, async (req, res) => {
  const { orderId, method, cardNumber, upiId } = req.body;
  if (!orderId || !method) return res.status(400).json({ error: 'orderId and method required' });

  const order = await prisma.order.findFirst({ where: { id: +orderId, userId: req.user.id } });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  if (order.status !== 'pending') return res.status(400).json({ error: 'Order already paid or cancelled' });

  // Validate payment method inputs
  if (method === 'card' && (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16))
    return res.status(400).json({ error: 'Invalid card number' });
  if (method === 'upi' && !upiId?.includes('@'))
    return res.status(400).json({ error: 'Invalid UPI ID' });

  const txnRef = `TXN-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

  const payment = await prisma.payment.create({
    data: { orderId: order.id, method, status: 'success', amount: order.total, txnRef }
  });

  await prisma.order.update({ where: { id: order.id }, data: { status: 'confirmed' } });

  res.json({ success: true, txnRef, amount: order.total, method, message: 'Payment successful! Your order is confirmed.' });
});

// Get payment by order
router.get('/order/:orderId', auth, async (req, res) => {
  const payment = await prisma.payment.findFirst({
    where: { orderId: +req.params.orderId, order: { userId: req.user.id } },
    include: { order: true }
  });
  if (!payment) return res.status(404).json({ error: 'Payment not found' });
  res.json(payment);
});

module.exports = router;
