var express = require('express');
var app = express();
var path = require("path");


app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/vis', function(req, res){
    res.sendFile(path.join(__dirname, '/vis.html'));
});
app.get('/vis_gen', function(req, res){
    res.sendFile(path.join(__dirname, '/vis_generic.html'));
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});