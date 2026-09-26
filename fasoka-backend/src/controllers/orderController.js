const db = require('../config/database');
require('dotenv').config();

// POST /api/orders - Créer une commande (checkout panier)
// body: { shop_id, mode_livraison, adresse_livraison, items: [{product_id, variant_id, quantite}], operateur }
async function createOrder(req, res, next) {
  const client = await db.pool.connect();
  try {
    const { shop_id, mode_livraison, adresse_livraison, items, operateur } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Le panier est vide.' });
    }

    await client.query('BEGIN');

    // Calcul du montant total à partir des prix réels en base (jamais faire confiance au client)
    let montant_total = 0;
    const lignesValidees = [];
    for (const item of items) {
      const produit = await client.query(`SELECT prix, stock_quantite FROM products WHERE id = $1 FOR UPDATE`, [item.product_id]);
      if (produit.rows.length === 0) throw { status: 404, message: `Produit ${item.product_id} introuvable.` };
      if (produit.rows[0].stock_quantite < item.quantite) {
        throw { status: 400, message: `Stock insuffisant pour un des produits.` };
      }
      montant_total += produit.rows[0].prix * item.quantite;
      lignesValidees.push({ ...item, prix_unitaire: produit.rows[0].prix });
    }

    const orderResult = await client.query(
      `INSERT INTO orders (client_id, shop_id, mode_livraison, adresse_livraison, montant_total)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, shop_id, mode_livraison || 'retrait', adresse_livraison || null, montant_total]
    );
    const order = orderResult.rows[0];

    for (const ligne of lignesValidees) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantite, prix_unitaire)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, ligne.product_id, ligne.variant_id || null, ligne.quantite, ligne.prix_unitaire]
      );
      await client.query(
        `UPDATE products SET stock_quantite = stock_quantite - $1 WHERE id = $2`,
        [ligne.quantite, ligne.product_id]
      );
    }

    // Paiement — en mode simulation tant que Mixx/Flooz ne sont pas branchés en vrai
    const transactionResult = await client.query(
      `INSERT INTO transactions (order_id, shop_id, montant, operateur, statut, reference_externe)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        order.id, shop_id, montant_total, operateur || 'especes',
        process.env.PAYMENT_SIMULATION_MODE === 'true' ? 'reussie' : 'en_attente',
        process.env.PAYMENT_SIMULATION_MODE === 'true' ? `SIM-${Date.now()}` : null,
      ]
    );

    await client.query('COMMIT');
    res.status(201).json({ order, transaction: transactionResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.status) return res.status(err.status).json({ error: err.message });
    next(err);
  } finally {
    client.release();
  }
}

// GET /api/orders/mine - Historique des commandes du client
async function myOrders(req, res, next) {
  try {
    const result = await db.query(
      `SELECT o.*, s.nom_boutique, s.logo_url
       FROM orders o JOIN shops s ON s.id = o.shop_id
       WHERE o.client_id = $1 ORDER BY o.created_at DESC`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// GET /api/shops/:shopId/orders - Commandes reçues par la boutique
async function shopOrders(req, res, next) {
  try {
    const { statut } = req.query;
    let query = `SELECT o.*, u.nom, u.prenom, u.telephone FROM orders o
                 JOIN users u ON u.id = o.client_id WHERE o.shop_id = $1`;
    const params = [req.params.shopId];
    if (statut) {
      params.push(statut);
      query += ` AND o.statut = $${params.length}`;
    }
    query += ` ORDER BY o.created_at DESC`;
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/orders/:orderId/statut - Le vendeur fait avancer la commande
async function updateOrderStatus(req, res, next) {
  try {
    const { statut } = req.body;
    const statutsValides = ['en_attente', 'confirmee', 'en_preparation', 'prete', 'livree', 'annulee'];
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }
    const result = await db.query(
      `UPDATE orders SET statut = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [statut, req.params.orderId]
    );

    // Quand une commande est livrée, on incrémente le compteur de ventes de la boutique
    if (statut === 'livree') {
      await db.query(`UPDATE shops SET nombre_ventes = nombre_ventes + 1 WHERE id = $1`, [result.rows[0].shop_id]);
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

module.exports = { createOrder, myOrders, shopOrders, updateOrderStatus };
