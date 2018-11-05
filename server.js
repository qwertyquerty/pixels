function zeros(dimensions) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }
    return array;
}

var DIM = [200, 300];
var pixels;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var ratelimits = {};

try {
    pixels = JSON.parse(fs.readFileSync("./pixels.json", "utf8"));
}
catch (e) {
    pixels = zeros(DIM);
    console.log(e);
}

app.use(express.static(__dirname + '/./client'));


io.on('connection', function(socket) {
    console.log("[CONNECTION] Online: " + io.engine.clientsCount)
    socket.emit('init', pixels);
    socket.emit("users", io.engine.clientsCount);
    socket.on('flip', function(p) {
        if (ratelimits[socket.id] && ((new Date()).getTime() - ratelimits[socket.id]) >= 100) {
            ratelimits[socket.id] = (new Date()).getTime();
            try {
                pixels[p.y][p.x] = +(!pixels[p.y][p.x]);
                io.emit('flip', {
                    x: p.x,
                    y: p.y
                });
            }
            catch (e) {
            }
        }
        else if (!ratelimits[socket.id]) {
            ratelimits[socket.id] = (new Date()).getTime();
            try {
                pixels[p.y][p.x] = +(!pixels[p.y][p.x]);
                io.emit('flip', {
                    x: p.x,
                    y: p.y
                });
            }
            catch (e) {
              console.log(e);
            }
        }
    });
});

setInterval(function() {
    io.emit("init", pixels);
    io.emit("users", io.engine.clientsCount);
}, 10000);

setInterval(function() {
    fs.writeFile(
        './pixels.json',
        JSON.stringify(pixels),
        function(err) {
            if (err) {}
        }
    );
}, 60000);

var ipaddress = "0.0.0.0"
var serverport = 40
http.listen(serverport, ipaddress, function() {
    console.log('[DEBUG] Listening on ' + ipaddress + ':' + serverport);
});
