// Load required packages
var mongoose = require('mongoose');

// Define our activities schema
var ExperimentSchema = new mongoose.Schema({
	id: Number,
	type: String,
	postDate: Date,
	content: {
		subtype: String,
		body: String
	}
});

// Export the Mongoose model
module.exports = mongoose.model('Experiment', ExperimentSchema);
