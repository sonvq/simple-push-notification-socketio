var express = require('express');
var app = express();
var path = require("path");
var http = require('http').Server(app);
var io = require('socket.io')(http);
var router = express.Router();

/* Creating POOL MySQL connection.*/

var bodyParser = require('body-parser')
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({// to support URL-encoded bodies
    extended: true
}));

router.get('/', function (req, res) {
    console.log('A user is connected on the web');
    res.sendStatus(201);
});

app.post('/send-push', function (req, res) {
    console.log('A push notification has been sent!');
    console.log(req.body);
    var name = req.body.name;
    var message = req.body.message;
    var channel_ids = req.body.channel_ids;
    var post_id = req.body.post_id;
    var published_time = req.body.published_time;
    
    if(channel_ids.indexOf(',') > -1) {
        var myarr = channel_ids.split(",");
        myarr.forEach(function(entry) {
            io.sockets.in(entry).emit("send message", {name: name, message: message, post_id: post_id, published_time: published_time}); 
        });
    } else {
        io.sockets.in(channel_ids).emit("send message", {name: name, message: message, post_id: post_id, published_time: published_time});   
    }
           
    console.log('done sent');
    res.sendStatus(200);
    res.end('message sent');

});

app.use('/', router);

io.on('connection', function (socket) {
    console.log('A user is connected with socket.io');
    socket.on('subscribe', function(channel) { 
        console.log('Joining channel', channel);
        socket.join(channel); 
    });

    socket.on('unsubscribe', function(channel) {  
        console.log('Leaving channel', channel);
        socket.leave(channel); 
    });   
    
    socket.on('disconnect', function(channel) {  
        console.log('socket disconnected', channel);
        socket.leave(channel); 
    });   
    
});


http.listen(8080, '172.16.10.140');
console.log('Server running at http://172.16.10.140:8080/');

