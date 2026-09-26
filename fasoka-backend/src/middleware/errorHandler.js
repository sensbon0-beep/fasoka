function errorHandler(err, req, res, next) {
  console.error(err.stack);

  // Erreurs Multer (upload de fichiers)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Image trop volumineuse (5 Mo maximum).' });
  }

  // Erreurs PostgreSQL courantes
  if (err.code === '23505') {
    return res.status(409).json({ error: 'Cette donnée existe déjà (doublon).' });
  }
  if (err.code === '23503') {
    return res.status(400).json({ error: 'Référence invalide (donnée liée introuvable).' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erreur interne du serveur.',
  });
}

module.exports = errorHandler;
