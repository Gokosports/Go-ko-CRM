const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  pdfPath: { type: String }, // This will store the path to the uploaded PDF
});

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
