//Variables and Constants

var ROW_Y = [65, 145, 225];
var START = {
	x: 202,
	y: 405,
	row: 5
}
var WIN = false;

// Enemies our player must avoid



var Enemy = function(x,y,speed) {
	// Variables applied to each of our instances go here,
	// we've provided one for you to get started

	// The image/sprite for our enemies, this uses
	// a helper we've provided to easily load images
	this.sprite = 'images/enemy-bug.png';
	this.row = y;
	this.y = ROW_Y[y];
	this.speed = speed;
	this.x = x; 
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
	// You should multiply any movement by the dt parameter
	// which will ensure the game runs at the same speed for
	// all computers.
	if (this.x < 505) {
		this.x = this.x + (this.speed * dt);
	}
	else {
		this.row = Math.floor(Math.random() * 3 + 1);
		this.y = this.row * 65;
		this.speed = 100 + Math.floor(Math.random() * 200);
		this.x = randomize(-100, -1); 
	}
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
	this.x = START.x;
	this.y = START.y;
	this.row = START.row;
}

Player.prototype.squishy = function() {
	for (enemy in allEnemies) {
		if (allEnemies[enemy].x + 100 > this.x + 50 && allEnemies[enemy].x < this.x + 100 && this.row === allEnemies[enemy].row) {
			gameReset();
		}
	}
}

Player.prototype.update = function() {
	switch(this.dir) {
		case "left":
			this.x = this.x - 101;
			break;
		case "right":
			this.x = this.x + 101;
			break;
		case "up":
			this.y = this.y - 83;
			this.row--;
			break;
		case "down":
			this.y = this.y + 83;
			this.row++;
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
	this.squishy();
	if (this.row === 0) {
		winning();
		}
}



Player.prototype.handleInput = function(dir) {
	if (win === true) {
		gameReset();
	}
	else {
		switch(dir) {
			case "left":
				if (this.x > 0) {
					this.dir = dir;
				}
				break;
			case "right":
				if (this.x < 400) {
					this.dir = dir;
				}
				break;
			case "up":
				if (this.y > 0) {
					this.dir = dir;
				}
				break;
			case "down":
				if (this.y < 400) {
					this.dir = dir;
				}
				break;
			default:
				this.x = this.x;
				this.y = this.y;
			break;
		}
	}
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player;
gameReset();


function gameReset() {
	allEnemies = [];
	for (i=0; i < ENEMY_MAX; i++) {
		var x = 0;
		var y = randomize(0,3);
		var speed = 100 + randomize(0, 200);
		allEnemies.push(new Enemy(x, y, speed));
	}
	player = new Player;
	WIN = false;
}

function winning() {
	win = true;
	//allEnemies = [];
	for (enemy in allEnemies) {
		allEnemies[enemy]
	var time = new Date().getTime() * 0.002;
	var x = Math.sin( time ) * 96 + 200;
	var y = Math.cos( time * 0.9 ) * 96 + 200;
	ctx.drawImage(Resources.get("images/star.png"), x, y);
	ctx.fillStyle = "gold";
	ctx.font = "bold 34pt Times New Roman";
	ctx.textAlign = "center";
	ctx.fillText("CONGRATULATIONS!", 250, 303);
	ctx.strokeStyle = "black";
	ctx.lineWidth = 2;
	ctx.strokeText("CONGRATULATIONS!", 250, 303);
	ctx.font = "bold 20pt Times New Roman";
	ctx.fillText("Press an Arrow to Play Again", 250, 450);
	ctx.lineWidth = 1;
	ctx.strokeText("Press an Arrow to Play Again", 250, 450);
}

function randomize(from, to) {
	var num = Math.floor(Math.random() * to + from);
	return num;
}

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
