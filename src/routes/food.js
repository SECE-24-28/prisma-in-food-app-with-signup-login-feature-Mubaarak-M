const router = require('express').Router();
const prisma = require('../prisma');

// Get all food items
router.get('/', async (req, res) => {
  const { category } = req.query;
  const where = { available: true };
  if (category) where.category = category;
  const items = await prisma.foodItem.findMany({ where });
  res.json(items);
});

// Get single food item
router.get('/:id', async (req, res) => {
  const item = await prisma.foodItem.findUnique({ where: { id: +req.params.id } });
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

module.exports = router;
