const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
  subscription: { type: Schema.Types.ObjectId, ref: 'Subscription', required: true },
  commercial: { type: Schema.Types.ObjectId, ref: 'Commercial', required: true },
  nomCommercial: { type: String, required: true },
  date: { type: Date, default: Date.now },
  statut: { type: String, enum: ['en attente', 'confirmée', 'terminée', 'annulée'], default: 'en attente' },
  notes: { type: String, required: false },
  prixHT: { type: Number, required: true },
  prixTTC: { type: Number, required: true },
  tva: { type: Number, required: true },
  marge: { type: Number, required: true },
  dateSport: { type: Date, required: true },
  location: { type: String, required: true },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
