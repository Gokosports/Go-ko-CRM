const express = require('express');
const router = express.Router();
const { getCounts } = require('../Controllers/sumController'); // Ajuster le chemin si nécessaire

// Route pour obtenir les compteurs
router.get('/counts', getCounts);

module.exports = router;
