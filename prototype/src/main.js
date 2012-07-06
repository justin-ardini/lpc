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
// class Player
////////////////////////////////////////////////////////////////////////////////
function Player() {
  this.keys = { left: false, right: false, up: false, down: false, fire: false };
  this.sprite = new Sprite(anims.player.standL);
  this.box = new Box(1, 1, 120, 120);
}

Player.prototype.update = function() {
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
  this.player = new Player();
}

Game.prototype.togglePause = function() {
  this.paused = !this.paused;
}

Game.prototype.update = function() {
  this.player.update();
}

Game.prototype.draw = function() {
  c.fillStyle = '#eee';
  c.fillRect(0, 0, c.canvas.width, c.canvas.height);

  c.fillStyle = 'black';
  c.beginPath();
  c.arc(100, 100, 100, 0, 2 * Math.PI, false);
  c.fill();

  this.player.draw();
}


////////////////////////////////////////////////////////////////////////////////
// Global data
////////////////////////////////////////////////////////////////////////////////
var c;
var game;
var anims = {
  setup: function() {
    /* Plane sprite sheets are 120x120px */
    var fox = document.getElementById('fox');
    var w = 120;
    var h = 120;
    this.player = {
      standL: new Animation(fox, w, h, calcFrames(0, 0, w, h, 1, 1), 3, false),
      standR: new Animation(fox, w, h, calcFrames(0, h, w, h, 1, 1), 3, false)
    };
  }
};



////////////////////////////////////////////////////////////////////////////////
// Game Loop
////////////////////////////////////////////////////////////////////////////////
window.onload = function() {
  c = document.getElementById('screen').getContext('2d');
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
