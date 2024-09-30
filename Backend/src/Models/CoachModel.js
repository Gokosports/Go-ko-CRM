const mongoose = require('mongoose');
const CommentSchema = require('./Comment').schema;

const CoachSchema = mongoose.Schema({
    nom: { type: String, required: false },
    prenom: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    type: { type: String, default: "all" },
    categoryComment: { type: String, default: "N/A" },
    password: { type: String, required: false },
    phone :{type: String},
    image:{type: String},
    age:{type: String},
    sex: { type: String, enum: ['homme', 'femme']},
    ville: {type: String},
    raisonsociale: {type: String},
    siret: {type: String},
    adresse: {type: String},
    codepostal: {type: Number},
    speciality: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Speciality', required: true }],
    role: { type: String,required: false },
    socialNetworks: {
        facebook: { type: String, required: false, default: '' },
        twitter: { type: String, required: false, default: '' },
        linkedin: { type: String, required: false, default: '' },
        instagram: { type: String, required: false, default: '' }
    },
    commercial: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercial' }, 
    commentaires: [CommentSchema],
  


},
{ timestamps: true }
);

module.exports = mongoose.model('Coach', CoachSchema);
