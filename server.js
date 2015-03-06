var express = require('express'),
	http = require('http'),
	app = express(),
	apiv1 = require('./api/v1/main'),
	passport = require('passport');

app.use(passport.initialize());
app.use(passport.session());

app.use('/api/v1', apiv1);
app.listen(process.env.PORT || 5000);
