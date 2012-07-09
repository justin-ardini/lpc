////////////////////////////////////////////////////////////////////////////////
// class Box
////////////////////////////////////////////////////////////////////////////////
function Box(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Box.prototype.center = function() {
  return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
};

Box.prototype.overlaps = function(other) {
  return other.x < this.x + this.width && other.x + other.width > this.x && other.y < this.y + this.height && other.y + other.height > this.y;
};

Box.prototype.draw = function(c) {
  //var d = 0.5 / tileSize;
  c.strokeStyle = 'red';
  c.strokeRect(this.x, this.y, this.width, this.height);
};


////////////////////////////////////////////////////////////////////////////////
// class Animation
// class Sprite
////////////////////////////////////////////////////////////////////////////////
var tileSize = 1.0; // TODO

function Animation(image, width, height, frames, speed, loop) {
  this.image = image;
  this.width = width / tileSize;
  this.height = height / tileSize;
  this.frames = frames;
  this.speed = speed;
  this.loop = loop;
  this.next = null;
}

Animation.prototype.draw = function(x, y, frame) {
  var offset = this.frames[frame % this.frames.length];
  c.drawImage(this.image, offset.x, offset.y, this.width * tileSize, this.height * tileSize, Math.round(x * tileSize) / tileSize, Math.round(y * tileSize) / tileSize, this.width, this.height);
};

function Sprite(anim) {
  this.x = 0;
  this.y = 0;
  this.anim = anim || null;
  this.frame = 0;
  this.countdown = 0;
  this.isDone = false;
}

Sprite.prototype.update = function() {
  if (++this.countdown >= this.anim.speed) {
    this.countdown = 0;
    if (++this.frame >= this.anim.frames.length) {
      this.frame = 0;
      if (this.anim.next) {
        this.anim = this.anim.next;
      } else if (!this.anim.loop) {
        this.frame = this.anim.frames.length - 1;
        this.isDone = true;
      }
    }
  }
};

Sprite.prototype.draw = function() {
  this.anim.draw(this.x, this.y, this.frame);
};

Sprite.prototype.setAnim = function(anim) {
  if (this.anim != anim) {
    this.anim = anim;
    this.frame = 0;
    this.countdown = 0;
    this.isDone = false;
  }
};

Sprite.prototype.centerOn = function(box) {
  this.x = box.x + (box.width - this.anim.width) / 2;
  this.y = box.y + (box.height - this.anim.height) / 2;
  return this;
};

function calcFrames(originX, originY, width, height, nx, n) {
  var frames = [];
  for (var y = 0, i = 0; i < n; y++) {
    for (var x = 0; x < nx && i < n; x++, i++) {
      frames.push({ x: originX + width * x, y: originY + height * y });
    }
  }
  return frames;
}


////////////////////////////////////////////////////////////////////////////////
// class World
////////////////////////////////////////////////////////////////////////////////
function World() {
  this.image = image;
  var tileData = tiles.background;
  this.width = tileData[0].length;
  this.height = tileData.length;

  // Create a single background visual from the individual tile images
  var tileSize = 32;
  var image = document.getElementById('tileset');
  this.visual = document.createElement('canvas');
  this.visual.width = this.width * tileSize;
  this.visual.height = this.height * tileSize;
  var vc = this.visual.getContext('2d');
  var n = Math.floor(image.width / tileSize);
  for (var x = 0; x < this.width; ++x) {
    for (var y = 0; y < this.height; ++y) {
      var tile = tileData[y][x];
      if (tile == -1) continue;
      var u = tile % n;
      var v = (tile - u) / n;
      vc.drawImage(image, u * tileSize, v * tileSize, tileSize, tileSize, x * tileSize, y * tileSize, tileSize, tileSize);
    }
  }
}

World.prototype.update = function() {
};

World.prototype.draw = function() {
  c.drawImage(this.visual, 0, 0, this.width * 32, this.height * 32);
};


////////////////////////////////////////////////////////////////////////////////
// class Player
////////////////////////////////////////////////////////////////////////////////
function Player() {
  this.keys = { left: false, right: false, up: false, down: false, fire: false };
  //this.sprite = new Sprite(anims.baldric.standR);
  //this.box = new Box(1, 1, 64, 64);
  this.sprite = new Sprite(anims.fox.faceR);
  this.box = new Box(1, 1, 160, 160);
}

Player.prototype.update = function() {
  var vx = this.keys.right - this.keys.left;
  var vy = this.keys.up - this.keys.down;

  if (vx > 0) {
    //this.sprite.setAnim(anims.baldric.walkR);
    this.sprite.setAnim(anims.fox.flyR);
  } else if (vx < 0){
    //this.sprite.setAnim(anims.baldric.walkL);
    this.sprite.setAnim(anims.fox.flyL);
  }
  if (vy > 0) {
    //this.sprite.setAnim(anims.baldric.walkU);
    this.sprite.setAnim(anims.fox.flyU);
  } else if (vy < 0) {
    //this.sprite.setAnim(anims.baldric.walkD);
    this.sprite.setAnim(anims.fox.flyD);
  }

  this.sprite.x = this.box.x - 1;
  this.sprite.y = this.box.y + this.box.height - this.sprite.anim.height;
  this.sprite.update();
}

Player.prototype.draw = function() {
  this.sprite.draw();
}


////////////////////////////////////////////////////////////////////////////////
// class Game
////////////////////////////////////////////////////////////////////////////////
function Game() {
  this.paused = false;
  this.world = new World();
  this.player = new Player();
}

Game.prototype.togglePause = function() {
  this.paused = !this.paused;
}

Game.prototype.update = function() {
  this.world.update();
  this.player.update();
}

Game.prototype.draw = function() {
  c.fillStyle = '#eee';
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);

  /*
  c.fillStyle = 'black';
  c.beginPath();
  c.arc(100, 100, 100, 0, 2 * Math.PI, false);
  c.fill();
  */

  this.world.draw();
  this.player.draw();
}


////////////////////////////////////////////////////////////////////////////////
// Global data
////////////////////////////////////////////////////////////////////////////////
var c;
var game;
var anims = {
  setup: function() {
    /* Baldric sprites are 64x64px */
    var baldric = document.getElementById('baldric');
    var w = 64;
    var h = 64;
    this.baldric = {
      standU: new Animation(baldric, w, h, calcFrames(0, 0, w, h, 1, 1), 4, false),
      standL: new Animation(baldric, w, h, calcFrames(0, h, w, h, 1, 1), 4, false),
      standD: new Animation(baldric, w, h, calcFrames(0, 2 * h, w, h, 1, 1), 4, false),
      standR: new Animation(baldric, w, h, calcFrames(0, 3 * h, w, h, 1, 1), 4, false),
      walkU: new Animation(baldric, w, h, calcFrames(w, 0, w, h, 8, 8), 4, true),
      walkL: new Animation(baldric, w, h, calcFrames(w, h, w, h, 8, 8), 4, true),
      walkD: new Animation(baldric, w, h, calcFrames(w, 2 * h, w, h, 8, 8), 4, true),
      walkR: new Animation(baldric, w, h, calcFrames(w, 3 * h, w, h, 8, 8), 4, true)
    };

    /* Plane sprites are 160x160px */
    var fox = document.getElementById('fox');
    var w = 160;
    var h = 160;
    this.fox = {
      faceU: new Animation(fox, w, h, calcFrames(0, 0, w, h, 1, 1), 3, false),
      faceUL: new Animation(fox, w, h, calcFrames(4 * w, 0, w, h, 1, 1), 3, false),
      faceL: new Animation(fox, w, h, calcFrames(8 * w, 0, w, h, 1, 1), 3, false),
      faceDL: new Animation(fox, w, h, calcFrames(12 * w, 0, w, h, 1, 1), 3, false),
      faceD: new Animation(fox, w, h, calcFrames(0, h, w, h, 1, 1), 3, false),
      faceDR: new Animation(fox, w, h, calcFrames(4 * w, h, w, h, 1, 1), 3, false),
      faceR: new Animation(fox, w, h, calcFrames(8 * w, h, w, h, 1, 1), 3, false),
      faceUR: new Animation(fox, w, h, calcFrames(12 * w, h, w, h, 1, 1), 3, false),
      flyU: new Animation(fox, w, h, calcFrames(0, 2 * h, w, h, 4, 4), 2, true),
      flyUL: new Animation(fox, w, h, calcFrames(4 * w, 2 * h, w, h, 4, 4), 2, true),
      flyL: new Animation(fox, w, h, calcFrames(8 * w, 2 * h, w, h, 4, 4), 2, true),
      flyDL: new Animation(fox, w, h, calcFrames(12 * w, 2 * h, w, h, 4, 4), 2, true),
      flyD: new Animation(fox, w, h, calcFrames(0, 3 * h, w, h, 4, 4), 2, true),
      flyDR: new Animation(fox, w, h, calcFrames(4 * w, 3 * h, w, h, 4, 4), 2, true),
      flyR: new Animation(fox, w, h, calcFrames(8 * w, 3 * h, w, h, 4, 4), 2, true),
      flyUR: new Animation(fox, w, h, calcFrames(12 * w, 3 * h, w, h, 4, 4), 2, true)
    };
  }
};

var tiles = {
  setup: function() {
    this.background = new Array(20);
    for (var i = 0; i < this.background.length; ++i) {
      this.background[i] = new Array(30);
    }

    for (var i = 0; i < this.background.length; ++i) {
      for (var j = 0; j < this.background[0].length; ++j) {
        if (Math.random() < 0.95) {
          this.background[i][j] = 20;
        } else {
          this.background[i][j] = 0;
        }
      }
    }
  }
};


////////////////////////////////////////////////////////////////////////////////
// Game Loop
////////////////////////////////////////////////////////////////////////////////
window.onload = function() {
  c = document.getElementById('screen').getContext('2d'); 
  tiles.setup();
  anims.setup();
  game = new Game();
  var time = new Date();
  setInterval(function() {
    var now = new Date();
    game.update((now - time) / 1000);
    game.draw();
    time = now;
  }, 1000 / 60);
  game.update(0);
  game.draw();
};

function actionForEvent(e) {
  var key = e.which;
  if (key == 32) return 'fire';
  if (key == 37) return 'left';
  if (key == 38) return 'up';
  if (key == 39) return 'right';
  if (key == 40) return 'down';
  if (key == 80) return 'pause'; // P
  return null;
}

window.onkeydown = function(e) {
  var action = actionForEvent(e);
  if (action == 'left') game.player.keys.left = true;
  else if (action == 'right') game.player.keys.right = true;
  else if (action == 'up') game.player.keys.up = true;
  else if (action == 'down') game.player.keys.down = true;
  else if (action == 'fire') game.player.keys.fire = true;
  else if (action == 'pause') game.toggledPause();
};

window.onkeyup = function(e) {
  var action = actionForEvent(e);
  if (action == 'left') game.player.keys.left = false;
  else if (action == 'right') game.player.keys.right = false;
  else if (action == 'up') game.player.keys.up = false;
  else if (action == 'down') game.player.keys.down = false;
  else if (action == 'fire') game.player.keys.fire = false;
};
