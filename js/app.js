
/*Variables and Constants*/

var ROW_Y = [60, 140, 220, 300, 380]; //Row positions for enemy bugs
var START = { //Starting position for player
    x: 202,
    y: 380,
    row: 5,
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
Player.prototype.collide = function() {
    for (enemy in allEnemies) {
        if (allEnemies[enemy].x + 100 > this.x + 50 && allEnemies[enemy].x < this.x + 100 && this.row === allEnemies[enemy].row) {
            gameReset();
        }
    }
    if (npc) {
        for (char in npc) {
            var cols = this.col - npc[char].col;
            var rows = this.row - npc[char].col;
            var coords = cols + "," + rows;
            if (this.approach !== this.dir) {
                switch(coords) {
                    case "1,0":
                        this.approach = "left";
                        npc[char].interact = true;
                        break;
                    case "0,1":
                        this.approach = "up";
                        npc[char].interact = true;
                        break;
                    case "-1,0":
                        this.approach = "right";
                        npc[char].interact = true;
                        break;
                    case "0,-1":
                        this.approach = "down";
                        npc[char].interact = true;
                        break;
                    default:
                        this.approach = "";
                        npc[char].interact = false;
                }
            }
            if (this.approach)
                if (this.approach === this.dir) {
                    npc[char].collide();
                }
        }
    }
};

Player.prototype.update = function() {
    if (this.approach !== this.dir) {
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
                if (this.y > 100) {
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
    }
    else {

    }
    this.collide();
    this.dir = "";
};

Player.prototype.render = function() {
    this.sprite = chars[selectedChar];
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    if (this.row === 0) {
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

var Nonplayer = function(col, row, sprite, type) {
    this.row = row;
    this.col = col;
    this.x = this.col * 101;
    this.y = ROW_Y[this.row];
    this.sprite = chars[sprite];
    this.rescued = false;
    this.interact = false;
    this.type = type;
    this.speech = [""]

};

Nonplayer.prototype.update = function() {
    if (this.rescued) {
        this.x = player.x + 200;
        this.y = player.y - 100;
    }
}

Nonplayer.prototype.render = function() {
    if (!this.rescued) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
    else {
        ctx.save();
        ctx.scale(.5, .5);
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
        ctx.restore();
    }
}

Nonplayer.prototype.collide = function() {
    this.rescued = true;
}

var Selector = function() {
    this.x = 0;
    this.realx = this.x * 101;
    this.y = 208;
    this.sprite = "images/selector.png";
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
            return;
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
var player;
var selector;
var npc = [new Nonplayer(2, 1, 1)];
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
    player.sprite = chars[selectedChar];
    WIN = false;
}

function winning() {
    WIN = true;
    allEnemies=[];
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
