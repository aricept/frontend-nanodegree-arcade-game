
/*Variables and Constants*/

var ROW_Y = [60, 140, 220, 300, 380]; //Row positions for enemy bugs
var NPC_Y = -35;
var START = { //Starting position for player
    lvl1: {
        x: 303,
        y: 297,
        row: 4,
        col: 3
    },
    lvl2: {
        y: 380,
        row: 5,
        col: [3, 2, 4, 1, 5],
        colPos: 0,
        x: 0
    }
};
START.lvl2.x = START.lvl2.col[START.lvl2.colPos] * 101;
var enemyMax = 4;
var win = false; //Triggers game won animation
var play = false; //Flag used to load character selector or start game
var selector;
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
    this.sprite = 'images/enemy-bug.png';
    this.y = ROW_Y[y];
    this.row = y + 1;
    this.speed = speed;
    this.x = x;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    
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

Enemy.prototype.left = function() {
    var left = this.x;
    return left;
}

Enemy.prototype.right = function() {
    var right = this.x + 100;
    return right;
}


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

Player.prototype.left = function() {
    var left = this.x + 35;
    return left;
}

Player.prototype.right = function() {
    var right = this.x + 70;
    return right;
}

//Collision detection method on player
Player.prototype.collide = function(prev) {
    for (enemy in allEnemies) {
        if (allEnemies[enemy].right() > this.left() && allEnemies[enemy].left() < this.right() && this.row === allEnemies[enemy].row) {
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
                    player.col = START.lvl2.col[0];
                    break;
            }
            for (var i = 0; i < npc.length; i++) {
                if (npc[i].rescued) {
                    npc[i].row = 0;
                    npc[i].col = randomize(0,6);
                    npc[i].x = npc[i].col * 101;
                    npc[i].y = NPC_Y;
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
                npc[np].collide();
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
			if (this.x < ctx.canvas.width - 200) {
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
    switch (level) {
        case 1:
            /*if(!win && this.row === 0) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }*/
            if (!win) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }
        	if (win) {
        		winning();
        	}
            break;
        case 2:
            if (!win && this.row > 0 && this.row < 5) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y + 30);
            }
            if (!win && (this.row === 5 || this.row === 0)) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }
            if (win) {
                this.row = START.lvl2.row;
                winning();
            }
            break;
    }
};

Player.prototype.halfRender = function() {
    var sprite = Resources.get(this.sprite);
    var face = 50;
    switch (level) {
        case 1:
            if(!win && this.row === 0) {
                ctx.drawImage(Resources.get(this.sprite), 0, face, sprite.width, 60, this.x, this.y + face, 101, 60);
            }
            break;
        case 2:
            if (!win && this.row > 0 && this.row < 5) {
                ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 60, this.x, this.y + face + 30, 101, 60);
            }
            break;
    }
}

Player.prototype.handleInput = function(dir) {
    if (win === true && level === 1) {
        level++;
        gameReset();
    }
    if (win === true && level === 2) {
        play = false;
        initLoad();
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
        this.y = NPC_Y;
    }
    if (level === 2) {
        this.y = NPC_Y;
    }
    this.sprite = chars[sprite];
    this.rescued = false;
    this.interact = false;
    this.speech = [''];
    this.distress = false;
    this.bob = {
        dir: 'down',
        top: -35,
        bottom: -25,
        move: 0.15
    };

};

Nonplayer.prototype.update = function() {
    if (this.distress) {
        if (level === 1) {
            if (this.bob.dir === 'down' && this.y < this.bob.bottom) {
                this.y += this.bob.move;
            }
            else {
                this.bob.dir = 'up';
                this.y -= this.bob.move;
                if (this.bob.dir === 'up' && this.y < this.bob.top) {
                    this.bob.dir = 'down';
                }
            }
        }
    }
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
                if (level === 2) {
                    START.lvl2.col.splice(START.lvl2.col.indexOf(this.col), 1);
                    START.lvl2.x = START.lvl2.col[0] * 101;
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
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
    else if (this.rescued) {
        ctx.drawImage(Resources.get(this.sprite), 0, 0, 101, 171, player.x, player.y + 20, 50, 85);
    }
    else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

Nonplayer.prototype.halfRender = function() {
    if (level === 1 && this.row === 0) {
        bobY = this.y - NPC_Y;
        ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 70 - bobY, this.x, this.y + 50, 101, 70 - bobY);
    }
}

Nonplayer.prototype.collide = function() {
    if (this.distress === true) {
		this.rescued = true;
	}
	this.distress = false;
}

var Selector = function() {
    this.x = 0;
    this.realx = this.x * 101 + 101;
    this.y = 208;
    this.sprite = 'images/Selector.png';
    this.alpha = 1;
    this.throbdir = 'down';
};

Selector.prototype.handleInput = function(key) {
    switch(key) {
        case 'left':
            selector.x > 0 ? (selector.x--, selector.realx = this.x * 101 + 101) : selector.x;
            break;
        case 'right':
            selector.x < 4 ? (selector.x++, selector.realx = this.x * 101 + 101) : selector.x;
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
    ctx.save();
    if (this.alpha > 0.5 && this.throbdir === 'down') {
        this.alpha -= 0.0075;
    }
    else {
        this.throbdir = 'up';
        this.alpha += 0.0075;
        if (this.alpha > 1 && this.throbdir === 'up') {
            this.throbdir = 'down';
        }
    }
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(Resources.get(this.sprite), this.realx, this.y);
    ctx.restore();
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player

var player;
var selector;
var allEnemies = [];
var npc = [];


function gameReset() {
    allEnemies = [];
    npc = [];
    enemyMax = (level === 2) ? 6 : 4;
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
	npcGenerate(1);
    win = false;
}

function npcGenerate(lvl) {
	switch(lvl) {
		case 1 || 2:
			if (npc.length - 1 < chars.length-2) {
				newFriend = friends.pop();
				npc.push(new Nonplayer(randomize(0,6),0,chars.indexOf(newFriend)));
				npc[npc.length-1].distress = true;
			}
			break;
	}
}

function winning() {
    win = true;
    allEnemies=[];
    var time = new Date().getTime() * 0.002;
    var x = Math.sin( time ) * 96 + 350;
    var y = Math.cos( time * 0.9 ) * 96 + 200;
    if (level === 1) {
        ctx.drawImage(Resources.get(player.sprite), x, y);
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 34pt Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', ctx.canvas.width/2, 303);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText('CONGRATULATIONS!', ctx.canvas.width/2, 303);
        ctx.font = 'bold 20pt Times New Roman';
        ctx.fillText('Press an Arrow to Continue', ctx.canvas.width/2, 450);
        ctx.lineWidth = 1;
        ctx.strokeText('Press an Arrow to Continue', ctx.canvas.width/2, 450);
        ctx.stroke();
    }
    if (level === 2) {
        ctx.drawImage(Resources.get(player.sprite), START.lvl2.x, START.lvl2.y);
        ctx.drawImage(Resources.get('images/Star.png'), x, y);
        ctx.fillStyle = 'gold';
        ctx.font = 'bold 34pt Times New Roman';
        ctx.textAlign = 'center';
        ctx.fillText('CONGRATULATIONS!', ctx.canvas.width/2, 303);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeText('CONGRATULATIONS!', ctx.canvas.width/2, 303);
        ctx.font = 'bold 20pt Times New Roman';
        ctx.fillText('Press an Arrow to Play Again', ctx.canvas.width/2, 450);
        ctx.lineWidth = 1;
        ctx.strokeText('Press an Arrow to Play Again', ctx.canvas.width/2, 450);
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
