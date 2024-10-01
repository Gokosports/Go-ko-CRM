// models/Event.js
const mongoose = require("mongoose");

const calendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
});

const Calendar = mongoose.model("Calendar", calendarSchema);
module.exports = Calendar;
