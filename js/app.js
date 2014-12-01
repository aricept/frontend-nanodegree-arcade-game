// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
	this.row = Math.floor(Math.random() * 3 + 1);
	this.y = this.row * 83;
	if (this.row === 1) {
		this.speed = Math.floor(Math.random() * 3 + 2);
	}
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
	this.x = this.x + (this.speed * dt);
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function() {
	this.sprite = "images/char-boy.png";
	this.x = 202;
	this.y = 405;
}

Player.prototype.update = function() {
	switch(this.dir) {
		case "left":
			if (this.x > 0) {
				this.x = this.x - 101;
			}
			break;
		case "right":
			if (this.x < 400) {
				this.x = this.x + 101;
			}
			break;
		case "up":
			if (this.y > 0) {
				this.y = this.y - 83;
			}
			break;
		case "down":
			if (this.y < 400) {
				this.y = this.y + 83;
			}
			break;
		default:
			this.x = this.x;
			this.y = this.y;
		break;
	}
	this.dir = "";
}

Player.prototype.render = function() {
	ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

Player.prototype.handleInput = function(dir) {
	this.dir = dir;
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = []
allEnemies.push(new Enemy);
var player = new Player;


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
