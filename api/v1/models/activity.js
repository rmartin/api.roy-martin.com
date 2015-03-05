// Load required packages
var mongoose = require('mongoose');

// Define our activities schema
var ActivitySchema  = new mongoose.Schema({
  id: Number,
  title: String,
  type: String,
  distance: Number,
  elapsedTime: Number,
  startDate: Date
});

// Export the Mongoose model
module.exports = mongoose.model('Activity', ActivitySchema);
