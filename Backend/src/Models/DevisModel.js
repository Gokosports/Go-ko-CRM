const mongoose = require('mongoose');

const devisSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
}, { timestamps: true });

const Devis = mongoose.model('Devis', devisSchema);

module.exports = Devis;