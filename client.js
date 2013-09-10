var socket = io.connect();
var currentPlayer;
var players = [];
var networkUpdateRate = 10;
var initialPosition = {x: 410, y: 90}

// Using Quintus engine.
var Q = Quintus()                         
        .include("Sprites, Scenes, Input, 2D, Touch, UI") 
        .setup({width: 640, height: 480}) 
        .controls()                     
        .touch();                      


Q.Sprite.extend("Player",{
  init: function(p) {
    var sprite = "player";
    this._super(p, { sheet: sprite, x: initialPosition.x, y: initialPosition.y });
    this.add('2d, platformerControls');
  }
});

Q.Sprite.extend("Opponent",{
  init: function(p) {
    this._super(p, { sheet: 'enemy', x: initialPosition.x, y: initialPosition.y});
  }
});

Q.scene("Stage",function(stage) {
  currentStage = stage;
  stage.collisionLayer(new Q.TileLayer({ dataAsset: 'level.json', sheet: 'tiles' }));
  currentPlayer.sprite = new Q.Player();
  var player = stage.insert(currentPlayer.sprite);
  stage.add("viewport").follow(player);
});

function update() {
  var position = { x: currentPlayer.sprite.p.x, y: currentPlayer.sprite.p.y };
  socket.emit('update', { position: position, playerId: currentPlayer.id })
}

function startGame() {
  Q.load("sprites.png, sprites.json, level.json, tiles.png", function() {
    Q.sheet("tiles","tiles.png", { tilew: 32, tileh: 32 });
    Q.compileSheets("sprites.png","sprites.json");
    Q.stageScene("Stage");
  });
  setInterval(update, networkUpdateRate);
}

function findPlayer(player) {
  for(var i=0; i<players.length; i++) {
    if(players[i].id == player.id) 
      return i;
  }
  return -1;
}

function removePlayer(playerId) {
  var index = findPlayer({id: playerId});
  if(index != -1) {
    var player = players[index];
    Q.stage().remove(player.sprite);
    players.splice(index, 1);
  }
}

function updateOrCreateOpponent(playerId, position) {
  var opponent = { id: playerId };
  var index = findPlayer(opponent);
  if(index == -1) {
    opponent.sprite = new Q.Opponent();
    players.push(opponent);
    Q.stage().insert(opponent.sprite);
  } else {
    opponent = players[index];
  }
  opponent.sprite.set(position);
}

// Socket bindings
function onConnected(player) {
  currentPlayer = player;
  startGame();
  players.push(currentPlayer);
}

function onOpponentUpdated(data) {
  updateOrCreateOpponent(data.playerId, data.position);
}

function onOpponentExited(data) {
  removeOpponent(data.playerId);
}

socket.on('onConnected', onConnected);
socket.on('onOpponentUpdated', onOpponentUpdated);
socket.on('onOpponentExited', onOpponentExited);

