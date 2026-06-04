require('dotenv').config();
const prisma = require('./src/prisma');

const foods = [
  { name: 'Chicken Biryani', description: 'Aromatic basmati rice with tender chicken', price: 180, category: 'Rice', image: '🍛' },
  { name: 'Paneer Butter Masala', description: 'Creamy tomato curry with paneer', price: 160, category: 'Curry', image: '🧆' },
  { name: 'Masala Dosa', description: 'Crispy dosa with potato filling and chutney', price: 80, category: 'South Indian', image: '🥞' },
  { name: 'Butter Naan', description: 'Soft tandoor bread with butter', price: 40, category: 'Bread', image: '🫓' },
  { name: 'Veg Fried Rice', description: 'Wok-tossed rice with fresh vegetables', price: 120, category: 'Rice', image: '🍚' },
  { name: 'Chicken Tikka', description: 'Marinated grilled chicken pieces', price: 200, category: 'Starter', image: '🍗' },
  { name: 'Dal Tadka', description: 'Yellow lentils tempered with spices', price: 90, category: 'Curry', image: '🥣' },
  { name: 'Mango Lassi', description: 'Chilled yogurt drink with alphonso mango', price: 60, category: 'Drinks', image: '🥭' },
  { name: 'Gulab Jamun', description: 'Soft milk dumplings in rose syrup', price: 50, category: 'Dessert', image: '🍮' },
  { name: 'Vada Pav', description: 'Mumbai street style spicy potato burger', price: 30, category: 'Snacks', image: '🍔' },
];

async function seed() {
  await prisma.foodItem.deleteMany();
  await prisma.foodItem.createMany({ data: foods });
  console.log(`✅ Seeded ${foods.length} food items`);
  await prisma.$disconnect();
}

seed().catch(e => { console.error(e); process.exit(1); });
