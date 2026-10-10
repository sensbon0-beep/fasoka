const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const accountRoutes = require('./routes/accountRoutes');
const { initialiserTables } = require('./controllers/accountController');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/account', accountRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'fasoka-backend' });
});

// Gestion des routes inconnues
app.use((req, res) => {
  res.status(404).json({ error: 'Route introuvable.' });
});

// Gestionnaire d'erreurs global (doit être en dernier)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Fasoka backend démarré sur le port ${PORT}`);
  // Crée la table des codes de confirmation si elle n'existe pas encore
  initialiserTables().catch((err) =>
    console.error('Initialisation des tables impossible :', err.message)
  );
});

module.exports = app;
