var express = require('express'),
	http = require('http'),
	app = express(),
	apiv1 = require('./api/v1/main');

app.use('/api/v1', apiv1);
app.listen(process.env.PORT || 5000);
