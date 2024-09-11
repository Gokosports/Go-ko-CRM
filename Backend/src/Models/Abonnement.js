const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const subscriptionSchema = new Schema({
  coach: { type: Schema.Types.ObjectId, ref: 'Coach', required: true },
  speciality: { type: Schema.Types.ObjectId, ref: 'Speciality', required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true }, // '1 mois', '3 mois', '1 an', etc.
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
