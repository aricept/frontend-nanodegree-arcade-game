// ---------- Global Variables and Constants ---------- \\

var ROW_Y = [60, 140, 220, 300, 380]; //Coordinates for our enemy bugs to spawn
var NPC_Y = -35; //Coordinates for NPC y-axis
var START = { //Player starting position info for each level
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
        x: 0
    }
};
START.lvl2.x = START.lvl2.col[0] * 101;
var enemyMax = 5; //Maximum number of enemies allowed for the level
var win = false; //Whether level has been won; used to trigger animations.
var play = false; //Whether the game has begun; used to trigger character selector screen
var instr = false; // Triggers instructions
var selector; //Character selector made globally available
var selectedChar; //Used as pointer for the selected sprite URL in array
var chars = [ //Array of URLs for player and NPC sprites
    'images/char-boy.png',
    'images/char-cat-girl.png',
    'images/char-horn-girl.png',
    'images/char-pink-girl.png',
    'images/char-princess-girl.png'
];
var level = 1; //Current level

// ---------- Classes ---------- \\


// ---------- Enemy Class ---------- \\

/* Enemies our player must avoid
 * x The left coordinate to begin drawing our enemy
 * y The row number on which our enemy travels
 * speed The number of pixels per second our enemy moves
 */
var Enemy = function(x,y,speed) {
    this.sprite = 'images/enemy-bug.png';
    this.y = ROW_Y[y];
    this.row = y + 1;
    this.speed = speed;
    this.x = x;
};

/* Update this enemy's position, required method for game
 * dt A time delta between ticks
 */
Enemy.prototype.update = function(dt) {
    //If they are on screen, they move their speed
    if (this.x < ctx.canvas.width) {
        this.x += (this.speed * dt);
    }
    else { //When bugs leave the screen on the right, they are redrawn off screen left
        this.speed = 100 + Math.floor(Math.random() * 200);
        this.x = randomize(-100, -300);
        this.row = (level === 2) ? randomize(0,3) : randomize(0,2);
        this.y = ROW_Y[this.row];
        this.row++;
    }
};

// Draw this enemy's sprite onscreen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Return this enemy's left value for collision detection
Enemy.prototype.left = function() {
    var left = this.x;
    return left;
}

// Return this enemy's right value for collision detection
Enemy.prototype.right = function() {
    var right = this.x + 100;
    return right;
}


// ---------- Player Class ---------- \\

//The Player character and information
var Player = function() {
    this.sprite = chars[selectedChar];
    this.dir = '';
    //This switch positions the player based on level
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
            this.col = START.lvl2.col[0];
            break;
    }

};

// Return the player's left value for collision detection
Player.prototype.left = function() {
    var left = this.x + 35;
    return left;
}

// Return the player's right value for collision detection
Player.prototype.right = function() {
    var right = this.x + 70;
    return right;
}

/* Collision detection method on player; uses row variables
 * to provide abstraction of y-axis.
 */
Player.prototype.collide = function(prev) {
    for (var e = 0; e < allEnemies.length; e++) {
        //When the player contacts an enemy, he is returned to his starting position
        if (allEnemies[e].right() > this.left()
            && allEnemies[e].left() < this.right()
            && this.row === allEnemies[e].row) {
            //This switch determines starting position to return player
            switch (level) {
                case 1:
                    this.x = START.lvl1.x;
                    this.y = START.lvl1.y;
                    this.row = START.lvl1.row;
                    this.col = START.lvl1.col;
                    break;
                case 2:
                    //prev = '';
                    this.x = START.lvl2.x;
                    this.y = START.lvl2.y;
                    this.row = START.lvl2.row;
                    // Index [0] is always used, since we remove any NPC occupied spaces
                    this.col = START.lvl2.col[0];
                    break;
            }
            //If the player is carrying an NPC, the NPC is placed in distress
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
    //Player and NPC cannot occupy a space, so collision pushes player back
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

// Updates player position and information
Player.prototype.update = function() {
    // Player's current position, recorded for later use in case of collision
    var prev = {'x': this.x, 'y': this.y, 'row': this.row, 'col': this.col};
    //This switch changes player position values based on keypress, if in canvas
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

// Player render method
Player.prototype.render = function() {
    //This switch determines the render method based on level
    switch (level) {
        case 1:
            if (!win) {
                ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
            }
        	if (win) {
        		winning();
        	}
            break;
        case 2:
            //In level 2, the sprite may be drawn before map tiles
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

// Renders a portion of the player sprite to simulate being in the water
Player.prototype.halfRender = function() {
    var sprite = Resources.get(this.sprite);
    var face = level === 1 ? 50 : 80; // The render position varies by level
    switch (level) {
        //This switch provides the render method based on level
        case 1:
            if(!win && this.row === 0) {
                ctx.drawImage(Resources.get(this.sprite), 0, face, sprite.width, 60, this.x, this.y + face, sprite.width, 60);
            }
            break;
        case 2:
            if (!win && this.row > 0 && this.row < 5) {
                ctx.drawImage(Resources.get(this.sprite), 0, 50, sprite.width, 60, this.x, this.y + face, 101, 60);
            }
            break;
    }
}

// Takes in user input and converts to directions for player
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

// ---------- Nonplayer, Nonenemy Class ---------- \\

/* The damsels/lad in distress
 * col The column the NPC is in
 * row The row the NPC is in
 * sprite The selected sprite for the NPC
 */
var Nonplayer = function(col, row, sprite) {
    this.row = row;
    this.col = col;
    this.x = this.col * 101;
    this.y = NPC_Y;
    this.sprite = chars[sprite];
    this.rescued = false; // Whether this NPC is currently being rescued
    this.interact = false; // Whether this NPC is interactable; not yet implemented
    this.speech = ['']; // Things this NPC can say when interacted with; not yet implemented
    this.distress = false; // Whether this NPC is in distress
    this.bob = { // Data to assist with the bob motion rendering
        dir: 'down', // Direction NPC is bobbing
        top: NPC_Y, // Top of bob motion
        bottom: NPC_Y + 10, // Bottom of bob motion
        move: 0.10 // Number of pixels to move per tick
    };

};

// NPC update method
Nonplayer.prototype.update = function() {
    //If the character has not been rescued yet
    if (this.distress) {
        if (level === 1) {
            this.swim();
        }
    }
    /* If the character is currently being rescued, they are rendered as
     * "carried" by the player, so we update based on player position
     */
    if (this.rescued) {
        this.row = player.row;
        this.col = player.col;
		var count = 0;
        /* If the player has reached the next-to-last row, and moves down,
         * we check if there are any other NPCs occupying that spot
         */
        if (player.row === 4 && player.dir === 'down') {
			for (var i = 0; i < npc.length; i++) {
				if (this.col === npc[i].col) {
					count++;
				}
			}
            //If no NPCs occupy that spot, the NPC is placed there
			if (count === 1) {
				this.x = player.x;
				this.y = 390;
				this.row = 5;
				this.col = player.col;
				this.rescued = false;
				player.dir = '';
				count = 0;
                //For level 2, we remove that column from the start array
                if (level === 2) {
                    START.lvl2.col.splice(START.lvl2.col.indexOf(this.col), 1);
                    START.lvl2.x = START.lvl2.col[0] * 101;
                }
				if (npc.length + 1 === chars.length) {
					win = true;
				}
				npcGenerate(1); // Generates a new NPC
			}
		}
	}
};

/* A helper function for the NPC update for the bob motion
 * If we are at the bottom of the bob, we switch directions and move up
 * At the top of the bob, we switch directions and move down
 */
Nonplayer.prototype.swim = function() {
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

// NPC render function
Nonplayer.prototype.render = function() {
    //If being rescued, the NPC is rendered as "carried" by player
    if (this.rescued) {
        ctx.drawImage(Resources.get(this.sprite), 0, 0, 101, 171, player.x, player.y + 20, 50, 85);
    }
    else {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

//Renders the above water portion of NPC for bob motion
Nonplayer.prototype.halfRender = function() {
    if (level === 1 && this.row === 0) {
        bobY = this.y - NPC_Y; // The above-water portion changes during the bob
        ctx.drawImage(Resources.get(this.sprite), 0, 50, 101, 70 - bobY, this.x, this.y + 50, 101, 70 - bobY);
    }
}

// Nonplayer collide
Nonplayer.prototype.collide = function() {
    if (this.distress === true) {
		this.rescued = true;
	}
	this.distress = false;
}

// ---------- Selector Class ---------- \\

/* Selector used for character selection
 * col Selector column
 * realx Vertical coordinate at which to draw selector
 * y Vertical coordinate
 * alpha Transparency value for the sprite
 * throbdir Direction of visual throb: down for transparent, up for opaque
 */
var Selector = function() {
    this.col = 0;
    this.x = this.col * 101 + 101;
    this.y = 208;
    this.sprite = 'images/Selector.png';
    this.alpha = 1;
    this.throbdir = 'down';
};

// Receives input from user to move selector
Selector.prototype.handleInput = function(key) {
    switch(key) {
        case 'left':
            this.col > 0 ? (this.col--, this.x = this.col * 101 + 101) : this.col;
            break;
        case 'right':
            this.col < 4 ? (this.col++, this.x = this.col * 101 + 101) : this.col;
            break;
        case 'enter':
            selectedChar = this.col;
            play = true;
            gameReset();
            break;
        default:
            break;
    }
};

// Selector render function
Selector.prototype.render = function() {
    ctx.save();
    this.throb();
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.restore();
};

// Helper for Selector.render that uses alpha transparency to "throb" the selector
Selector.prototype.throb = function() {
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
}

// ---------- Instantiation ---------- \\
var player;
var selector;
var allEnemies = [];
var npc = [];
var instructions;

// ---------- Helper Functions ---------- \\

// Resets all variables to factory settings
function gameReset() {
    allEnemies = [];
    npc = [];
    START.lvl2.col = [3, 2, 4, 1, 5];
    START.lvl2.x = START.lvl2.col[0] * 101;
    enemyMax = (level === 2) ? 8 : 5;
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

/* Generates a new NPC; utilizing the switch within can allow level-specific
 * NPC generation methods, or unique NPCs, currently unutilized
 */
function npcGenerate(lvl) {
	switch(lvl) {
		case 1:
            /* We create an array containing all of the char sprites,
             * and pop() them off as we use them until we reach end of array
             */
			if (npc.length - 1 < chars.length-2) {
				newFriend = friends.pop();
				npc.push(new Nonplayer(randomize(0,6),0,chars.indexOf(newFriend)));
				npc[npc.length-1].distress = true;
			}
			break;
	}
}

//Win animation by level
function winning() {
    win = true;
    allEnemies=[];
    var time = new Date().getTime() * 0.002;
    var x = Math.sin( time ) * 96 + 350;
    var y = Math.cos( time * 0.9 ) * 96 + 200;
    if (level === 1) {
        // Player dances around the now enemy free road
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
        // Player stands beside the rescuees, and a star dances above
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

// Random number generator within a specified range
function randomize(from, to) {
    var num = Math.floor(Math.random() * (to - from + 1) + from);
    return num;
}

// Instantiates our selector; called in Engine.js before init()
function initLoad() {
    selector = new Selector;
}

/* This listens for key presses and sends the keys to your
 * Player.handleInput() method. You don't need to modify this.
 */
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
