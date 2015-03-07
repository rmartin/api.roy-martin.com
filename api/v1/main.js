var apiv1 = require('express').Router(),
	_ = require('underscore'),
	mongoose = require('mongoose'),
	ActivityModel = require('./models/activity'),
	passport = require('passport'),
	TwitterStrategy = require('passport-twitter').Strategy,
	strava = null;

	passport.use(new TwitterStrategy({
		consumerKey: process.env.TWITTER_APP_CONSUMER_KEY,
		consumerSecret: process.env.TWITTER_APP_CONSUMER_SECRET,
		callbackURL: "http://127.0.0.1:5000/api/v1/auth/twitter/callback"
	},
	function(token, tokenSecret, profile, done) {
		res.json(profile);
	}
	));

mongoose.connect(process.env.MONGOLAB_URI);

//get list of activities such as runs and workouts
apiv1.get('/activities', function(req, res) {
	// Use the model to find all activities
	ActivityModel.find(function(err, activities) {
		if (err)
			res.send(err);

		res.jsonp(activities);
	});
});

apiv1.get('/activities/update', function(req, res) {

	//dump model prior to inserting
	ActivityModel.remove().exec();

	strava = new require("strava")({
		client_id: process.env.STRAVA_CLIENT_ID,
		client_secret: process.env.STRAVA_CLIENT_SECRET,
		redirect_uri: process.env.STRAVA_REDIRECT_URL,
		access_token: process.env.STRAVA_ACCESS_TOKEN
	});

	strava.athlete.activities.get({}, function(args, results) {
		_.each(results, function(activity) {
			activityModel = new ActivityModel();

			activityModel.id = activity.id;
			activityModel.title = activity.name;
			activityModel.type = activity.type;
			activityModel.distance = activity.distance;
			activityModel.elapsedTime = activity.elapsed_time;
			activityModel.startDate = activity.start_date

			// Save the activity and check for errors
			activityModel.save(function(err) {
				if (err)
					res.send(err);
			});
		});

		res.json({
			message: 'Activites have been updated.',
			data: results
		});
	});
});

//combine twitter and blog posts
apiv1.get('/thoughts', function(req, res) {
	res.jsonp({});
});

apiv1.get('/thoughts/update', function(req, res) {


});

apiv1.get('/auth/twitter',
  passport.authenticate('twitter'));

apiv1.get('/auth/twitter/callback',
  passport.authenticate('twitter', { failureRedirect: '/' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

//books, podcasts, etc
apiv1.get('/learning', function(req, res) {
	res.jsonp({});
});

//coding and development related updates
apiv1.get('/coding', function(req, res) {
	res.jsonp({});
});

module.exports = apiv1;
