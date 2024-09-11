const express = require('express');
const router = express.Router();
const {
  creerAbonnement,
  lireAbonnements,
  mettreAJourAbonnement,
  supprimerAbonnement,
} = require('../Controllers/AbonnementController');

router.post('/abonnements', creerAbonnement);
router.get('/abonnements', lireAbonnements);
router.put('/abonnements/:id', mettreAJourAbonnement);
router.delete('/abonnements/:id', supprimerAbonnement);

module.exports = router;
