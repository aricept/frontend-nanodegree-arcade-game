
/*Variables and Constants*/

var ROW_Y = [60, 140, 220, 300, 380]; //Row positions for enemy bugs
var START = { //Starting position for player
    x: 202,
    y: 297,
    row: 4,
    col: 2
};
var WIN = false; //Triggers game won animation
var ENEMY_MAX = 4;
var PLAY = false; //Flag used to load character selector or start game
var selectedChar; //Used as pointer for the selected sprite URL in array
var chars = [
    "images/char-boy.png",
    "images/char-cat-girl.png",
    "images/char-horn-girl.png",
    "images/char-pink-girl.png",
    "images/char-princess-girl.png"
];
var level = 1;
var selector;

// Enemies our player must avoid



var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.y = ROW_Y[y];
    this.row = y;
    this.row = this.row + 1;
    this.speed = speed;
    this.x = x;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    
    //When bugs leave the screen on the right, they are redrawn off screen left
    if (this.x < 505) {
        this.x = this.x + (this.speed * dt);
    }
    else {
        this.speed = 100 + Math.floor(Math.random() * 200);
        this.x = randomize(-100, -1);
        this.row = randomize(0,3);
        this.y = ROW_Y[this.row];
        this.row++;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

//The row properties for player and enemy are used to abstract collisions
var Player = function() {
    this.sprite = chars[selectedChar];
    this.x = START.x;
    this.y = START.y;
    this.row = START.row;
    this.col = START.col;
};

//Collision detection method on player
Player.prototype.collide = function(prev) {
    for (enemy in allEnemies) {
        if (allEnemies[enemy].x + 100 > this.x + 50 && allEnemies[enemy].x < this.x + 50 && this.row === allEnemies[enemy].row) {
            gameReset();
        }
    }
    if (npc.length > 0) {
        for (i = 0; i < npc.length; i++) {
            if (this.col === npc[i].col && this.row === npc[i].row) {
				this.x = prev.x;
				this.y = prev.y;
				this.row = prev.row;
				this.col = prev.col;
				this.dir="";
				npc[i].collide(prev);
			}
        }
    }
};

Player.prototype.update = function() {
	var prev = {"x": this.x, "y": this.y, "row": this.row, "col": this.col};
	switch(this.dir) {
		case "left":
			if (this.x > 100) {
				this.x = this.x - 101;
				this.col--;
			}
			break;
		case "right":
			if (this.x < 400) {
				this.x = this.x + 101;
				this.col++;
			}
			break;
		case "up":
			if (this.y > 10) {
				this.y = this.y - 83;
				this.row--;
			}
			break;
		case "down":
			if (this.y < 300) {
				this.y = this.y + 83;
				this.row++;
		}
			break;
		default:
			this.x = this.x;
			this.y = this.y;
			break;
	}
    this.collide(prev);
    this.dir = "";
};

Player.prototype.render = function() {
    //this.sprite = chars[selectedChar];
    if(!WIN) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
    if (this.row === 0) {
        gameReset();
    }
	if (WIN) {
		winning();
	}
};



Player.prototype.handleInput = function(dir) {
    if (WIN === true) {
        gameReset();
    }
    else {
        this.dir = dir;
    }
};

var Nonplayer = function(col, row, sprite) {
    this.row = row;
    this.col = col;
    this.x = this.col * 101;
    this.y = ROW_Y[row];
    this.sprite = chars[sprite];
    this.rescued = false;
    this.interact = false;
    this.speech = [""];
    this.distress = false;
	this.approach = false;

};

Nonplayer.prototype.update = function() {
    if (this.rescued) {
        this.row = player.row;
        this.col = player.col;
		var count = 0;
        if (player.row === 4 && player.dir === "down") {
			for (var i = 0; i < npc.length; i++) {
				if (this.col === npc[i].col) {
					count++;
				}
			}
			if (count === 1) {
				this.x = player.x;
				this.y = 380;
				this.row = 5;
				this.col = player.col;
				this.rescued = false;
				player.dir = "";
				count = 0;
				if (npc.length + 1 === chars.length) {
					WIN = true;
				}
				npcGenerate(1);
			}
		}	
	}
};

Nonplayer.prototype.render = function() {
    if (this.distress) {
        ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 60, this.x, this.y, 101, 60);
    }
    else if (this.rescued) {
        ctx.drawImage(Resources.get(this.sprite), 0, 0, 101, 171, player.x, player.y + 20, 50, 85);
    }
    else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

Nonplayer.prototype.collide = function(prev) {
	if (this.distress === true) {
		this.rescued = true;
	}
	this.distress = false;
	player.x = prev.x;
	player.y = prev.y;
	player.row = prev.row;
	player.col = prev.col;
	player.dir="";
}

var Selector = function() {
    this.x = 0;
    this.realx = this.x * 101;
    this.y = 208;
    this.sprite = "images/Selector.png";
};

Selector.prototype.handleInput = function(key) {
    switch(key) {
        case "left":
            if (selector.x > 0) {
                selector.x--;
                selector.realx = this.x * 101;
            }
            break;
        case "right":
            if (selector.x < 4) {
                selector.x++;
                selector.realx = this.x * 101;
            }
            break;
        case "enter":
            selectedChar = selector.x;
            PLAY = true;
			gameReset();
            return;
            break;
        default:
            break;
    }
};

Selector.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.realx, this.y);
    var selThrob = ctx.getImageData(this.x, this.y, Resources.get(this.sprite).width, Resources.get(this.sprite).height);
    console.log(selThrob.data);
    for (p = 3; p < selThrob.length; p + 4) {
        selThrob[p]++;
        if (selThrob[p] > 255) {
            selThrob[p] = 0;
        }
    }
    console.log(selThrob.data);
    ctx.putImageData(selThrob, this.x, this.y);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var player = new Player();
var selector;
var allEnemies = [];
var npc = [];



function gameReset() {
    allEnemies = [];
    npc = [];
    for (i=0; i < ENEMY_MAX; i++) {
        var x = 0;
        var y = randomize(0,3);
        var speed = 100 + randomize(0, 200);
        allEnemies.push(new Enemy(x, y, speed));
    }
    player = new Player;
    player.sprite = chars[selectedChar];
	friends = chars.slice(0);
	friends.splice(friends.indexOf(player.sprite),1);
	npcGenerate(1,friends);
    WIN = false;
}

function npcGenerate(lvl) {
	switch(lvl) {
		case 1:
			if (npc.length - 1 < chars.length-2) {
				newFriend = friends.pop();
				npc.push(new Nonplayer(randomize(0,5),0,chars.indexOf(newFriend)));
				npc[npc.length-1].distress = true;
			}
			break;
	}
}

function winning() {
    WIN = true;
    allEnemies=[];
    var time = new Date().getTime() * 0.002;
    var x = Math.sin( time ) * 96 + 200;
    var y = Math.cos( time * 0.9 ) * 96 + 200;
    //ctx.drawImage(Resources.get("images/Star.png"), x, y);
    ctx.drawImage(Resources.get(player.sprite), x, y);
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
    ctx.stroke();
}

function randomize(from, to) {
    var num = Math.floor(Math.random() * to + from);
    return num;
}

function initLoad() {
    selector = new Selector;
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        13: 'enter',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };
    if (PLAY === false) {
        selector.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
