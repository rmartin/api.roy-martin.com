// Load required packages
var mongoose = require('mongoose');

// Define our activities schema
var SocialSchema  = new mongoose.Schema({
  id: Number,
  title: String,
  type: String,
  postDate: Date
});

// Export the Mongoose model
module.exports = mongoose.model('Social', SocialSchema);
