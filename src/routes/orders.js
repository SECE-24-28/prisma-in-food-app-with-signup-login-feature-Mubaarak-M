const router = require('express').Router();
const prisma = require('../prisma');
const auth = require('../middleware');

// Place order
router.post('/', auth, async (req, res) => {
  const { items } = req.body; // [{foodItemId, quantity}]
  if (!items?.length) return res.status(400).json({ error: 'No items in order' });

  const foodItems = await prisma.foodItem.findMany({
    where: { id: { in: items.map(i => i.foodItemId) }, available: true }
  });

  if (foodItems.length !== items.length)
    return res.status(400).json({ error: 'Some items unavailable' });

  const total = items.reduce((sum, i) => {
    const food = foodItems.find(f => f.id === i.foodItemId);
    return sum + food.price * i.quantity;
  }, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user.id,
      total,
      items: {
        create: items.map(i => ({
          foodItemId: i.foodItemId,
          quantity: i.quantity,
          price: foodItems.find(f => f.id === i.foodItemId).price
        }))
      }
    },
    include: { items: { include: { foodItem: true } } }
  });

  res.status(201).json(order);
});

// Get user orders
router.get('/my', auth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user.id },
    include: { items: { include: { foodItem: true } }, payment: true },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// Get order by id
router.get('/:id', auth, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: { id: +req.params.id, userId: req.user.id },
    include: { items: { include: { foodItem: true } }, payment: true }
  });
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

module.exports = router;
