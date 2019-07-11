var app = require('express')();
var http = require('http').Server(app);


http.listen(5000, () => console.log('Server started listening on port 5000!'));