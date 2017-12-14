var express = require('express'),
	app = express();

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile(__dirname + '/index.html');
});

app.listen(4444, function() {
	console.log('server is up');
});
