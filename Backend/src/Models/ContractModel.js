const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  clientName: { type: String, required: true },
  email: { type: String, required: true },
  commercialName: { type: String, required: true },
  contractDuration: { type: String, required: true },
  raisonsociale: {type: String, required: true},
  phone: {type: String, required: true}
}, { timestamps: true });

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
