const mongoose = require('mongoose');

const CommercialSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    imageUrl: { type: String, required: false },  // Champ pour l'image
    password: { type: String, required: true }, // Champ pour le mot de passe
}, { timestamps: true });

const modelName = 'Commercial';

if (mongoose.models[modelName]) {
    module.exports = mongoose.model(modelName);
} else {
    module.exports = mongoose.model(modelName, CommercialSchema);
}
