const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../utils/jwt');

// Génère un code de confirmation à 6 chiffres
function generateConfirmationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/auth/signup
async function signup(req, res, next) {
  try {
    const { nom, prenom, email, telephone, mot_de_passe } = req.body;

    if (!nom || !prenom || !mot_de_passe || (!email && !telephone)) {
      return res.status(400).json({
        error: 'Nom, prénom, mot de passe et (email ou téléphone) sont obligatoires.',
      });
    }

    const mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);
    const code_confirmation = generateConfirmationCode();

    const result = await db.query(
      `INSERT INTO users (nom, prenom, email, telephone, mot_de_passe_hash, code_confirmation)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, nom, prenom, email, telephone, compte_verifie, created_at`,
      [nom, prenom, email || null, telephone || null, mot_de_passe_hash, code_confirmation]
    );

    const user = result.rows[0];

    // TODO: envoyer le code_confirmation par SMS ou email (intégration à venir)
    console.log(`Code de confirmation pour ${user.id}: ${code_confirmation}`);

    const token = generateToken(user.id);
    res.status(201).json({ user, token });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/confirm
async function confirmAccount(req, res, next) {
  try {
    const { user_id, code } = req.body;
    const result = await db.query(
      `UPDATE users SET compte_verifie = TRUE, code_confirmation = NULL
       WHERE id = $1 AND code_confirmation = $2
       RETURNING id, compte_verifie`,
      [user_id, code]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Code de confirmation invalide.' });
    }
    res.json({ message: 'Compte confirmé avec succès.', user: result.rows[0] });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { identifiant, mot_de_passe } = req.body; // identifiant = email ou téléphone

    const result = await db.query(
      `SELECT * FROM users WHERE email = $1 OR telephone = $1`,
      [identifiant]
    );
    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const motDePasseValide = await bcrypt.compare(mot_de_passe, user.mot_de_passe_hash);
    if (!motDePasseValide) {
      return res.status(401).json({ error: 'Identifiants incorrects.' });
    }

    const token = generateToken(user.id);
    delete user.mot_de_passe_hash;
    res.json({ user, token });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, confirmAccount, login };
