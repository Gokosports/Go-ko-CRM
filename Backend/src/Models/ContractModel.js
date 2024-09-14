const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
}, { timestamps: true });

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
