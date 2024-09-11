const Order = require('../Models/Commande');
const Subscription = require('../Models/Abonnement');
const Client = require('../Models/ClientModel');
const Commercial = require('../Models/Commercial');

// Créer une commande
const creerCommande = async (req, res) => {
  const { clientId, subscriptionId, commercialId, notes, tva, dateSport, location } = req.body;

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).send('Client non trouvé');

    const subscription = await Subscription.findById(subscriptionId).populate('coach').populate('speciality');
    if (!subscription) return res.status(404).send('Abonnement non trouvé');

    const commercial = await Commercial.findById(commercialId);
    if (!commercial) return res.status(404).send('Commercial non trouvé');

    const prixHT = subscription.price;
    const prixTTC = prixHT * (1 + tva / 100);
    const marge = prixHT * 0.10;

    const commande = new Order({
      client: clientId,
      subscription: subscriptionId,
      commercial: commercialId,
      nomCommercial: commercial.nom,
      notes: notes || '',
      prixHT: prixHT,
      prixTTC: prixTTC,
      tva: tva,
      marge: marge,
      dateSport: dateSport,
      location: location,
    });

    await commande.save();
    res.status(201).json(commande);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

// Lire toutes les commandes
const lireCommandes = async (req, res) => {
  try {
    const commandes = await Order.find().populate('client').populate('subscription').populate('commercial');
    res.status(200).json(commandes);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

// Mettre à jour une commande
const mettreAJourCommande = async (req, res) => {
  const { id } = req.params;
  const { subscriptionId, notes, statut, tva, dateSport, location } = req.body;

  try {
    let commande = await Order.findById(id);
    if (!commande) return res.status(404).send('Commande non trouvée');

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) return res.status(404).send('Abonnement non trouvé');

    const prixHT = subscription.price;
    const prixTTC = prixHT * (1 + tva / 100);
    const marge = prixHT * 0.10;

    commande.subscription = subscriptionId;
    commande.notes = notes || commande.notes;
    commande.statut = statut || commande.statut;
    commande.tva = tva || commande.tva;
    commande.prixHT = prixHT;
    commande.prixTTC = prixTTC;
    commande.marge = marge;
    commande.dateSport = dateSport || commande.dateSport;
    commande.location = location || commande.location;

    await commande.save();
    res.status(200).json(commande);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

// Supprimer une commande
const supprimerCommande = async (req, res) => {
  const { id } = req.params;

  try {
    const commande = await Order.findByIdAndDelete(id);
    if (!commande) return res.status(404).send('Commande non trouvée');
    res.status(200).send('Commande supprimée');
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

module.exports = {
  creerCommande,
  lireCommandes,
  mettreAJourCommande,
  supprimerCommande,
};
