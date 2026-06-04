require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/food', require('./src/routes/food'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/payments', require('./src/routes/payments'));

app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🍽️  FoodApp running → http://localhost:${PORT}`));
