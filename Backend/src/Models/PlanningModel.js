const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
  coachId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Coach' }, // Assuming you have a Coach model
  time: { type: String, required: true }, // Store time in HH:mm format
  callSituation: { type: String, required: true, enum: ['Scheduled', 'Completed', 'Canceled'] },
  comment: { type: String, required: false },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

const Planning = mongoose.model('Planning', planningSchema);

module.exports = Planning;
