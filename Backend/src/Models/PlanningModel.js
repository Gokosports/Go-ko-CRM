const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
  time: { type: String, required: true },
  callSituation: { type: String, required: true },
  comment: { type: String, required: true },
  coachId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Coach' }, // Make this optional
}, { timestamps: true });

module.exports = mongoose.model('Planning', planningSchema);
