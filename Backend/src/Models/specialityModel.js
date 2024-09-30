const mongoose = require('mongoose');

const specialitySchema = new mongoose.Schema({
  nom: { type: String, required: true },
  description: { type: String, required: false }
});

const Speciality = mongoose.model('Speciality', specialitySchema);

module.exports = Speciality;
