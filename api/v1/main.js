var apiv1 = require('express').Router(),
	_ = require('underscore'),
	mongoose = require('mongoose'),
	ActivityModel = require('./models/activity'),
	SocialModel = require('./models/social'),
	ExperimentModel = require('./models/experiment'),
	request = require('request'),
	babel = require('babel'),
	babelPoly = require("babel/polyfill"),
	strava = null,
	config = {
		"consumerKey": process.env.TWITTER_APP_CONSUMER_KEY,
		"consumerSecret": process.env.TWITTER_APP_CONSUMER_SECRET,
		"accessToken": process.env.TWITTER_ACCESS_TOKEN,
		"accessTokenSecret": process.env.TWITTER_ACCESS_SECRET,
		"callBackUrl": process.env.TWITTER_CALLBACK_URL
	},
	Twitter = require('twitter-js-client').Twitter,
	twitter = new Twitter(config);

mongoose.connect(process.env.MONGOLAB_URI);


//get list of activities such as runs and workouts
apiv1.get('/all', function(req, res) {
	var apiResponse = [];

	// Use the model to find all activities
	ActivityModel.find(function(err, activities) {
		if (err)
			res.send(err);

		apiResponse.concat(activities);
	}).then(result -> {
		// Use the model to find all activities
		SocialModel.find(function(err, thoughts) {
			if (err)
				res.send(err);

			apiResponse.concat(thoughts);
		})
	}).then(result -> {
		// Use the model to find all activities
		ExperimentModel.find(function(err, experiments) {
			if (err)
				res.send(err);

			apiResponse.concat(experiments);
		});
	}).then(() -> {
		res.jsonp(apiResponse);
	});

});

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

		res.jsonp({
			message: 'Activites have been updated.',
			data: results
		});
	});
});

//combine twitter and blog posts
apiv1.get('/thoughts', function(req, res) {
	// Use the model to find all activities
	SocialModel.find(function(err, thoughts) {
		if (err)
			res.send(err);

		res.jsonp(thoughts);
	});
});


apiv1.get('/thoughts/update', function(req, res) {

	//dump model prior to inserting
	SocialModel.remove().exec();

	twitter.getUserTimeline({
		screen_name: 'roy_martin',
		count: '10'
	}, function() {
		//error handler
	}, function(results) {

		//parse the results
		results = JSON.parse(results);

		_.each(results, function(twitterUpdate) {
			socialModel = new SocialModel();
			socialModel.id = twitterUpdate.id;
			socialModel.body = twitterUpdate['text'];
			socialModel.type = 'twitter';
			socialModel.postDate = twitterUpdate.created_at

			// Save the activity and check for errors
			socialModel.save(function(err) {
				if (err)
					res.send(err);
			});
		});

		res.jsonp({
			message: 'Activites have been updated.',
			data: results
		});
	});
});

//books, podcasts, etc


apiv1.get('/experiments', function(req, res) {
	// Use the model to find all activities
	ExperimentModel.find(function(err, experiments) {
		if (err)
			res.send(err);

		res.jsonp(experiments);
	});
});

apiv1.get('/experiments/update', function(req, res) {

	//dump model prior to inserting
	ExperimentModel.remove().exec();

	request({
		url: 'https://api.github.com/users/rmartin/events',
		headers: {
			'Accept': 'application/vnd.github.v3+json',
			'User-Agent': 'rmartin'
		}
	}, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var github = JSON.parse(body);

			_.each(github, function(githubItem) {
				if (githubItem.type === 'PushEvent') {

					experimentModel = new ExperimentModel();
					experimentModel.id = githubItem.id;
					experimentModel.type = githubItem.type;
					experimentModel.body = githubItem.payload.commits[0].message;
					experimentModel.postDate = githubItem.created_at;

					// Save the experiment and check for errors
					experimentModel.save(function(err) {
						if (err)
							res.send(err);
					});
				}
			});

			res.jsonp({
				message: 'Experiments have been updated.',
				data: github
			});

		}
	});
});

//coding and development related updates
apiv1.get('/coding', function(req, res) {
	res.jsonp({});
});

module.exports = apiv1;
