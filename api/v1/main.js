var apiv1 = require('express').Router(),
	_ = require('underscore'),
	mongoose = require('mongoose'),
	ActivityModel = require('./models/activity'),
	SocialModel = require('./models/social'),
	ExperimentModel = require('./models/experiment'),
	request = require('request'),
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

	var promise = ActivityModel.find().exec();
	promise.then(function(activities) {
		apiResponse = apiResponse.concat(activities);
		return SocialModel.find().exec();

	}).then(function(thoughts) {
		apiResponse = apiResponse.concat(thoughts);

		return ExperimentModel.find().exec();
	}).then(function(experiments) {
		apiResponse = apiResponse.concat(experiments);

		//randomize the results and limit to the top 20
		apiResponse = _.sample(apiResponse, 20);

		return res.jsonp({
			status: 'ok',
			data: apiResponse
		});
	}).then(null, function(err) {
		return res.jsonp({
			status: 'error',
			data: err
		});
	});

});

//get list of activities such as runs and workouts
apiv1.get('/activities', function(req, res) {
	// Use the model to find all activities
	ActivityModel.find(function(err, activities) {
		if (err)
			res.send(err);

		res.jsonp({
			status: 'ok',
			data: activities
		});
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
			activityModel = new ActivityModel({
				id: activity.id,
				type: 'activity',
				postDate: activity.start_date,
				content: {
					title: activity.name,
					subtype: activity.type,
					distance: activity.distance,
					elapsedTime: activity.elapsed_time
				}
			});

			// Save the activity and check for errors
			activityModel.save(function(err) {
				if (err)
					res.send(err);
			});
		});

		res.jsonp({
			status: 'ok',
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

		res.jsonp({
			status: 'ok',
			data: thoughts
		});
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
			socialModel = new SocialModel({
				id: twitterUpdate.id,
				type: 'thoughts',
				postDate: twitterUpdate.created_at,
				content: {
					subtype: 'twitter',
					body: twitterUpdate['text']
				}
			});

			// Save the activity and check for errors
			socialModel.save(function(err) {
				if (err)
					res.send(err);
			});
		});

		res.jsonp({
			status: 'ok',
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

		res.jsonp({
			message: 'ok',
			data: experiments
		});
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

					experimentModel = new ExperimentModel({
						id: githubItem.id,
						type: 'experiments',
						postDate: githubItem.created_at,
						content: {
							subtype: githubItem.type,
							body: githubItem.payload.commits[0].message
						}
					});

					// Save the experiment and check for errors
					experimentModel.save(function(err) {
						if (err)
							res.send(err);
					});
				}
			});

			res.jsonp({
				status: 'ok',
				data: github
			});

		}
	});
});

module.exports = apiv1;
