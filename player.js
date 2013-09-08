function Player(id) {
  this.id = id;
}

module.exports = Player;

Player.prototype.indexIn = function(array) {
  for(var i=0; i<array.length; i++) {
    if(array[i].id == this.id) 
      return i;
  }
  return -1;
}

