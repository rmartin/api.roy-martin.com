var apiv1 = require('express').Router(),
    strava = new require("strava")({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        redirect_uri: process.env.STRAVA_REDIRECT_URL,
        access_token: process.env.STRAVA_ACCESS_TOKEN
    });

//get list of activities such as runs and workouts
apiv1.get('/activities', function(req, res) {
    strava.athlete.activities.get({}, function(args, results) {
        res.jsonp(results);
    });
});

//combine twitter and blog posts
apiv1.get('/thoughts', function(req, res) {
    res.jsonp({});
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
