
/*Variables and Constants*/

var ROW_Y = [60, 140, 220, 300, 380]; //Row positions for enemy bugs
var NPC_Y = {
    lvl1: 60,
    lvl2: -35
};
var START = { //Starting position for player
    lvl1: {
        x: 202,
        y: 297,
        row: 4,
        col: 2
    },
    lvl2: {
        y: 380,
        row: 5,
        col: [2, 1, 0, 3, 4],
        colPos: 0,
        x: 0
    }
};
START.lvl2.x = START.lvl2.col[START.lvl2.colPos] * 101;
var enemyMax = 4;
var win = false; //Triggers game won animation
var play = false; //Flag used to load character selector or start game
var selectedChar; //Used as pointer for the selected sprite URL in array
var chars = [
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];
var level = 1;

// Enemies our player must avoid



var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.y = ROW_Y[y];
    this.row = y;
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
    if (this.x < ctx.canvas.width) {
        this.x = this.x + (this.speed * dt);
    }
    else {
        this.speed = 100 + Math.floor(Math.random() * 200);
        this.x = randomize(-100, -300);
        this.row = (level === 2) ? randomize(0,3) : randomize(0,2);
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
    switch (level) {
        case 1:
            this.x = START.lvl1.x;
            this.y = START.lvl1.y;
            this.row = START.lvl1.row;
            this.col = START.lvl1.col;
            break;
        case 2:
            this.x = START.lvl2.x;
            this.y = START.lvl2.y;
            this.row = START.lvl2.row;
            this.col = START.lvl2.col[START.lvl2.colPos];
            break;
    }
    
};

//Collision detection method on player
Player.prototype.collide = function(prev) {
    for (enemy in allEnemies) {
        if (allEnemies[enemy].x + 100 > this.x + 50 && allEnemies[enemy].x < this.x + 50 && this.row === allEnemies[enemy].row) {
            switch (level) {
                case 1:
                    player.x = START.lvl1.x;
                    player.y = START.lvl1.y;
                    player.row = START.lvl1.row;
                    player.col = START.lvl1.col;
                    break;
                case 2:
                    prev = '';
                    player.x = START.lvl2.x;
                    player.y = START.lvl2.y;
                    player.row = START.lvl2.row;
                    player.col = START.lvl2.col[START.lvl2.colPos];
                    break;
            }
            for (var i = 0; i < npc.length; i++) {
                if (npc[i].rescued) {
                    npc[i].row = 0;
                    npc[i].col = randomize(0,3);
                    npc[i].x = npc[i].col * 101;
                    switch (level) {
                        case 1:
                            npc[i].y = NPC_Y.lvl1;
                            break;
                        case 2:
                            npc[i].y = NPC_Y.lvl2;
                            break;
                    }
                    npc[i].distress = true;
                    npc[i].rescued = false;
                }
            }
        }
    }
    if (npc.length > 0) {
        for (var np = 0; np < npc.length; np++) {
            if (this.col === npc[np].col && this.row === npc[np].row) {
                player.x = prev.x;
                player.y = prev.y;
                player.row = prev.row;
                player.col = prev.col;
                player.dir='';
                npc[np].collide(prev);
			}
        }
    }
};

Player.prototype.update = function() {
	var prev = {'x': this.x, 'y': this.y, 'row': this.row, 'col': this.col};
	switch(this.dir) {
		case 'left':
			if (this.x > 100) {
				this.x = this.x - 101;
				this.col--;
			}
			break;
		case 'right':
			if (this.x < 400) {
				this.x = this.x + 101;
				this.col++;
			}
			break;
		case 'up':
			if (this.y > 10) {
				this.y = this.y - 83;
				this.row--;
			}
			break;
		case 'down':
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
    this.dir = '';
};

Player.prototype.render = function() {
    //this.sprite = chars[selectedChar];
    switch (level) {
        case 1:
            if(!win && this.row === 0) {
                ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 60, this.x, this.y + 95, 101, 60);
            }
            if (!win && this.row > 0) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }
        	if (win) {
        		winning();
        	}
            break;
        case 2:
            if (!win && this.row > 0 && this.row < 5) {
                ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 60, this.x, this.y + 90, 101, 60);
            }
            if (!win && (this.row === 5 || this.row === 0)) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }
            if (win) {
                winning();
            }
            break;
    }
};



Player.prototype.handleInput = function(dir) {
    if (win === true && level === 1) {
        level++;
        gameReset();
    }
    if (win === true && level === 2) {
        level--;
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
    if (level === 1) {
        this.y = NPC_Y.lvl1;
    }
    if (level === 2) {
        this.y = NPC_Y.lvl2;
    }
    this.sprite = chars[sprite];
    this.rescued = false;
    this.interact = false;
    this.speech = [''];
    this.distress = false;
	this.approach = false;

};

Nonplayer.prototype.update = function() {
    if (this.rescued) {
        this.row = player.row;
        this.col = player.col;
		var count = 0;
        if (player.row === 4 && player.dir === 'down') {
			for (var i = 0; i < npc.length; i++) {
				if (this.col === npc[i].col) {
					count++;
				}
			}
			if (count === 1) {
				this.x = player.x;
				this.y = 390;
				this.row = 5;
				this.col = player.col;
				this.rescued = false;
				player.dir = '';
				count = 0;
                if (level === 2 && this.col === START.lvl2.col[START.lvl2.colPos]) {
                    START.lvl2.colPos++;
                    START.lvl2.x = START.lvl2.col[START.lvl2.colPos] * 101;
                    for (var n = 0; n < npc.length; n++) {
                        if (START.lvl2.col[START.lvl2.colPos] === npc[n].col) {
                            START.lvl2.colPos++;
                            START.lvl2.x = START.lvl2.col[START.lvl2.colPos] * 101;
                        }
                    }
                }
				if (npc.length + 1 === chars.length) {
					win = true;
				}
				npcGenerate(1);
			}
		}	
	}
};

Nonplayer.prototype.render = function() {
    if (this.distress) {
        if (level === 1) {
            ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 60, this.x, this.y, 101, 60);
        }
        else {
            ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        }
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
}

var Selector = function() {
    this.x = 0;
    this.realx = this.x * 101;
    this.y = 208;
    this.sprite = 'images/Selector.png';
};

Selector.prototype.handleInput = function(key) {
    switch(key) {
        case 'left':
            if (selector.x > 0) {
                selector.x--;
                selector.realx = this.x * 101;
            }
            break;
        case 'right':
            if (selector.x < 4) {
                selector.x++;
                selector.realx = this.x * 101;
            }
            break;
        case 'enter':
            selectedChar = selector.x;
            play = true;
            selector = '';
			gameReset();
            break;
        default:
            break;
    }
};

Selector.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.realx, this.y);
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player = new Player;
var selector;
var allEnemies = [];
var npc = [];


function gameReset() {
    allEnemies = [];
    npc = [];
    (level === 2) ? enemyMax = 6 : enemyMax = 4;
    for (i=0; i < enemyMax; i++) {
        var x = 0;
        var y = (level === 2) ? randomize(0,3) : randomize(0,2);
        var speed = 100 + randomize(0, 200);
        allEnemies.push(new Enemy(x, y, speed));
    }
    player = new Player;
    player.sprite = chars[selectedChar];
	friends = chars.slice(0);
	friends.splice(friends.indexOf(player.sprite),1);
	npcGenerate(1,friends);
    win = false;
}

function npcGenerate(lvl) {
	switch(lvl) {
		case 1 || 2:
			if (npc.length - 1 < chars.length-2) {
				newFriend = friends.pop();
				npc.push(new Nonplayer(randomize(0,4),0,chars.indexOf(newFriend)));
				npc[npc.length-1].distress = true;
			}
			break;
	}
}

function winning() {
    win = true;
    allEnemies=[];
    var time = new Date().getTime() * 0.002;
    var x = Math.sin( time ) * 96 + 200;
    var y = Math.cos( time * 0.9 ) * 96 + 200;
    if (level === 1) {
        ctx.drawImage(Resources.get(player.sprite), x, y);
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 34pt Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', 250, 303);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText('CONGRATULATIONS!', 250, 303);
        ctx.font = 'bold 20pt Times New Roman';
        ctx.fillText('Press an Arrow to Continue', 250, 450);
        ctx.lineWidth = 1;
        ctx.strokeText('Press an Arrow to Continue', 250, 450);
        ctx.stroke();
    }
    if (level === 2) {
        ctx.drawImage(Resources.get(player.sprite), START.lvl2.x, START.lvl2.y);
        ctx.drawImage(Resources.get('images/Star.png'), x, y);
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 34pt Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', 250, 303);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText('CONGRATULATIONS!', 250, 303);
        ctx.font = 'bold 20pt Times New Roman';
        ctx.fillText('Press an Arrow to Play Again', 250, 450);
        ctx.lineWidth = 1;
        ctx.strokeText('Press an Arrow to Play Again', 250, 450);
        ctx.stroke();
    }
    
}

function randomize(from, to) {
    var num = Math.floor(Math.random() * (to - from + 1) + from);
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
    if (play === false) {
        selector.handleInput(allowedKeys[e.keyCode]);
    }
    else {
        player.handleInput(allowedKeys[e.keyCode]);
    }
});
