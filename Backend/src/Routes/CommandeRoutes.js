const express = require('express');
const router = express.Router();
const {
  creerCommande,
  lireCommandes,
  mettreAJourCommande,
  supprimerCommande,
} = require('../Controllers/CommandeController');

router.post('/commandes', creerCommande);
router.get('/commandes', lireCommandes);
router.put('/commandes/:id', mettreAJourCommande);
router.delete('/commandes/:id', supprimerCommande);

module.exports = router;
