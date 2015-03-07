var express = require('express'),
	http = require('http'),
	app = express(),
	apiv1 = require('./api/v1/main'),
	session = require('express-session'),
	passport = require('passport');

app.use(session({
	secret: process.env.EXPRESS_SESSION_SECRET,
	resave: false,
	saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/v1', apiv1);
app.listen(process.env.PORT || 5000);
