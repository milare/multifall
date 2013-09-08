var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server),
    fs = require('fs'),
    port = process.env.port || 3000,

    // Classes
    Player = require('./player.js'), 
    UUID = require('node-uuid')

server.listen(port);
console.log('\t ::SERVER - Listening on port ' + port );

var players = [];


// Socket server
io.sockets.on('connection', function(client) {

  // Creates a new player
  player = new Player(UUID());
  client.player = player;

  // Return the new player info to the player itself
  client.emit('onConnected', player)

  // Add new player to the list of players
  players.push(player);

  client.on('update', function (data) {
    player = new Player(data.playerId);
    client.broadcast.emit('onPlayerUpdated', { playerId: player.id, position: data.position });
  });

  // Client disconnected 
  client.on('disconnect', function () {
    // Remove player from players list
    var player = client.player;
    client.broadcast.emit('onPlayerExited', { playerId: player.id });
    index = player.indexIn(players);
    players.splice(index, 1);
  });

});


// Forward root to index.html
app.get( '/', function(req, res) {
  res.sendfile( '/index.html' , { root:__dirname });
});

// Route to any other file but index.html
app.get( '/*' , function(req, res, next) {
  var file = req.params[0];
  res.sendfile( __dirname + '/' + file );
}); 
