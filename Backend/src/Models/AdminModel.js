const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imageUrl: { type: String }
},
{ timestamps: true }
);

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
