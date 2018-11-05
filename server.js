function zeros(dimensions) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }
    return array;
}

var cfg = require('./config.json');

var DIM = cfg["dim"];
var pixels;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');

var ratelimits = {};

try {
    pixels = JSON.parse(fs.readFileSync(cfg["pixels_path"], "utf8"));
}
catch (e) {
    pixels = zeros([DIM[1], DIM[0]]);
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
}, cfg["init_interval"]);

setInterval(function() {
    fs.writeFile(
        cfg["pixels_path"],
        JSON.stringify(pixels),
        function(err) {
            if (err) {}
        }
    );
}, cfg["save_interval"]);


http.listen(cfg["port"], cfg["host"], function() {
    console.log('[DEBUG] Listening on ' + cfg["host"] + ':' + cfg["port"]);
});
