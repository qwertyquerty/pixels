function dimensional_array(dimensions,default_value) {
    var array = [];
    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? default_value : dimensional_array(dimensions.slice(1), default_value));
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

var colors = ["#000000", "#FFFFFF", "#880000", "#AAFFEE", "#CC44CC", "#00CC55", "#0000AA", "#EEEE77", "#DD8855", "#664400", "#FF7777", "#333333", "#777777", "#AAFF66", "#0088FF", "#BBBBBB"];

var ratelimits = {};

try {
    pixels = JSON.parse(fs.readFileSync(cfg["pixels_path"], "utf8"));
}
catch (e) {
    pixels = dimensional_array([DIM[1], DIM[0]], cfg["default_color"]);
    console.log(e);
}

app.use(express.static(__dirname + '/./client'));


io.on('connection', function(socket) {
    console.log("[CONNECTION] Online: " + io.engine.clientsCount)
    socket.emit('init', pixels);
    socket.emit("users", io.engine.clientsCount);
    socket.on('set', function(p) {
        if (ratelimits[socket.id] && ((new Date()).getTime() - ratelimits[socket.id]) >= cfg["ratelimit"]) {
            ratelimits[socket.id] = (new Date()).getTime();
            try {
                if (p.y < DIM[1] && p.x < DIM[0] && p.y>=0 && p.x >= 0 && Number.isInteger(p.c) && p.c >=0 && p.c < colors.length) {
                    pixels[p.y][p.x] = p.c
                    io.emit('set', {
                        x: p.x,
                        y: p.y,
                        c: p.c
                    });
                }
            }
            catch (e) {
            }
        }
        else if (!ratelimits[socket.id]) {
            ratelimits[socket.id] = (new Date()).getTime();
            try {
                if (p.y < DIM[1] && p.x < DIM[0] && p.y>=0 && p.x >= 0 && Number.isInteger(p.c) && p.c >=0 && p.c < colors.length) {
                    pixels[p.y][p.x] = p.c
                    io.emit('set', {
                        x: p.x,
                        y: p.y,
                        c: p.c
                    });
                }
            }
            catch (e) {
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
