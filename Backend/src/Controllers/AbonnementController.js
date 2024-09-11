const Subscription = require('../Models/Abonnement');

// Créer un abonnement
const creerAbonnement = async (req, res) => {
  const { coachId, specialityId, price, duration } = req.body;

  try {
    const abonnement = new Subscription({
      coach: coachId,
      speciality: specialityId,
      price,
      duration,
    });

    await abonnement.save();
    res.status(201).json(abonnement);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

// Lire tous les abonnements
const lireAbonnements = async (req, res) => {
  try {
    const abonnements = await Subscription.find().populate('coach').populate('speciality');
    res.status(200).json(abonnements);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

// Mettre à jour un abonnement
const mettreAJourAbonnement = async (req, res) => {
  const { id } = req.params;
  const { coachId, specialityId, price, duration } = req.body;

  try {
    const abonnement = await Subscription.findByIdAndUpdate(id, {
      coach: coachId,
      speciality: specialityId,
      price,
      duration,
    }, { new: true }).populate('coach').populate('speciality');
    if (!abonnement) return res.status(404).send('Abonnement non trouvé');
    res.status(200).json(abonnement);
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

// Supprimer un abonnement
const supprimerAbonnement = async (req, res) => {
  const { id } = req.params;

  try {
    const abonnement = await Subscription.findByIdAndDelete(id);
    if (!abonnement) return res.status(404).send('Abonnement non trouvé');
    res.status(200).send('Abonnement supprimé');
  } catch (error) {
    res.status(500).send('Erreur serveur');
  }
};

module.exports = {
  creerAbonnement,
  lireAbonnements,
  mettreAJourAbonnement,
  supprimerAbonnement,
};
