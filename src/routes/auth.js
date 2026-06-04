const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

// Signup
router.post('/signup', async (req, res) => {
  const { name, email, phone, password, address } = req.body;
  if (!name || !email || !phone || !password)
    return res.status(400).json({ error: 'All fields required' });

  const exists = await prisma.user.findFirst({ where: { OR: [{ email }, { phone }] } });
  if (exists) return res.status(400).json({ error: 'Email or phone already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, phone, password: hashed, address } });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone } });
});

// Profile
router.get('/profile', require('../middleware'), async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, phone: true, address: true, createdAt: true }
  });
  res.json(user);
});

module.exports = router;
