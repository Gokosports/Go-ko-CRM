const mongoose = require('mongoose');
const CommentSchema = require('./Comment').schema;

const ClientSchema = new mongoose.Schema({
    nom: { type: String, required: false },
    prenom: { type: String, required: false },
    email: { type: String, required: false, unique: false },
    password: { type: String, required: false },
    phone: { type: String },
    imageUrl: { type: String },
    age: { type: String },
    sex: { type: String, enum: ['homme', 'femme'] },
    address: { type: String },
    commercial: { type: mongoose.Schema.Types.ObjectId, ref: 'Commercial' }, 
    commentaires: [CommentSchema],
    type: { type: String, default: "all" },
}, { timestamps: true });


const modelName = 'Client';

if (mongoose.models[modelName]) {
    module.exports = mongoose.model(modelName);
} else {
    module.exports = mongoose.model(modelName, ClientSchema);
}