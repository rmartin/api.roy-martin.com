var apiv1 = require('express').Router(),
    strava = new require("strava")({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        redirect_uri: process.env.STRAVA_REDIRECT_URL,
        access_token: process.env.STRAVA_ACCESS_TOKEN
    });

//get list of activities from Strava API
apiv1.get('/strava/listActivities', function(req, res) {
    strava.athlete.activities.get({}, function(args, results) {
        res.jsonp(results);
    });
});

module.exports = apiv1;
