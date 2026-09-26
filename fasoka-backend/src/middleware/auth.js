const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalide ou expiré.' });
  }
}

// Vérifie que l'utilisateur connecté est bien propriétaire (ou membre d'équipe) de la boutique visée
async function requireShopAccess(req, res, next) {
  const db = require('../config/database');
  const shopId = req.params.shopId || req.body.shop_id;
  try {
    const result = await db.query(
      `SELECT s.id FROM shops s
       LEFT JOIN shop_team_members tm ON tm.shop_id = s.id AND tm.user_id = $1
       WHERE s.id = $2 AND (s.owner_id = $1 OR tm.user_id = $1)`,
      [req.userId, shopId]
    );
    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Accès non autorisé à cette boutique.' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth, requireShopAccess };
