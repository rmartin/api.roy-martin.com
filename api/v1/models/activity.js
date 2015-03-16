// Load required packages
var mongoose = require('mongoose');

// Define our activities schema
var ActivitySchema = new mongoose.Schema({
	id: Number,
	type: String,
	postDate: Date,
	content: {
		title: String,
		subtype: String,
		distance: Number,
		elapsedTime: Number
	}
});

// Export the Mongoose model
module.exports = mongoose.model('Activity', ActivitySchema);
