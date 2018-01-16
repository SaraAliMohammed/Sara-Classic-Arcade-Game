"use strict";

var app = app || {};
app.CANVAS_WIDTH = 909;
app.EnemyMaxSpeed = 400;
app.gamePaused = false;
app.gameUnPaused = false;
app.allGameItems = new Map();
//function to create random number between 3 numbers
app.getRandomNumber = function() {
    return Math.floor((Math.random() * 10) / 3);
}  
//function to delete hearts and gems
app.deleteHeartsGems = function () {
    app.allGameItems.forEach(function (item) {
        if (item instanceof Heart || item instanceof Gem)
            app.allGameItems.delete(item.key);
    },this);
}
//function to delete allGameItems
app.deleteGameItems = function () {
    app.allGameItems.forEach(function (item) {
        app.allGameItems.delete(item.key);
    }, this);
}

//function to restart game 
app.restartGame = function () {
    app.player.loseGame = false;
    app.player.winGame = false;
    app.player.level = 1;
    app.player.points = 0;
    app.player.lifes = 3;
    app.allEnemies = [];
    app.createEnemies();
    app.deleteGameItems();
}

// Enemies our player must avoid
var Enemy = function() {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.x = this.getX();
    this.y = this.getY();
    this.speed = this.getSpeed();
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // Multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (app.gamePaused !== true) {
        this.x += this.speed * dt;
        if (this.x > app.CANVAS_WIDTH) {
            this.x = this.getX();
            this.y = this.getY();
            this.speed = this.getSpeed();
        }
    }
};

// Draw the enemy on the screen
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.getX = function () {
    var num = 0;
    switch (app.getRandomNumber()) {
        case 0:
            num = -150;
            break;
        case 1:
            num = -350;
            break;
        default:
            num = -550;
    }
    return num;
};

Enemy.prototype.getY = function () {
    var num = 0;
    switch (app.getRandomNumber()) {
        case 0:
            num = 63;
            break;
        case 1:
            num = 143; //63+83
            break;
        default:
            num = 226; //143+83
    }
    return num;
};

Enemy.prototype.getSpeed = function () {
    return Math.floor((Math.random() * (app.EnemyMaxSpeed - 100))) + 100; //to get random number between min and max Math.random() * (max - min) + min;
};

Enemy.prototype.reset = function () {
    this.x = this.getX();
    this.y = this.getY();
}

function allEnemiesReset() {
    for (var i = 0; i < app.allEnemies.length; i++) {
        app.allEnemies[i].reset();
    }
}

// Class player has an update(), render() and
// a handleInput() method.
var Player = function () {
    this.PLAYER_INIT_X_COORD = 404;
    this.PLAYER_INIT_Y_COORD = 400;//390
    this.x = this.PLAYER_INIT_X_COORD;
    this.y = this.PLAYER_INIT_Y_COORD;
    this.xValue = 0; //To handle rock collision
    this.yValue = 0; //To handle rock collision
    this.sprite = 'images/char-boy.png';
    this.PLAYER_X_MOVE = 101; //width of column
    this.PLAYER_Y_MOVE = 83; //height of row
    this.PLAYER_LEFT_LIMIT = 0; //Left of canvas
    this.PLAYER_RIGHT_LIMIT = 808; // Right of canvas
    this.PLAYER_UP_LIMIT = 0; // Top of canvas 
    this.PLAYER_DOWN_LIMIT = 606; // Bottom of canvas 
    this.isCollided = false;
    this.level = 1;
    this.points = 0;
    this.lifes = 3;
    this.loseGame = false;
    this.winGame = false;

}

Player.prototype.update = function () {

    this.checkCollision();
    this.checkBarrierCollision();

    if(this.x < this.PLAYER_LEFT_LIMIT)
        this.x = this.PLAYER_LEFT_LIMIT;

    if (this.x > this.PLAYER_RIGHT_LIMIT)
        this.x = this.PLAYER_RIGHT_LIMIT;

    if (this.y > this.PLAYER_INIT_Y_COORD)
        this.y = this.PLAYER_INIT_Y_COORD;

    //player reached water 
    if (this.y == -15) {
        this.y = 400;
        this.increaseLevel();
    }
}

Player.prototype.render = function () {
    if (this.isCollided === false) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    } else {
        ctx.drawImage(Resources.get('images/char-boy-sad.png'), this.x , this.y + 50);
    }
}

Player.prototype.handleInput = function (key) {
    this.xValue = 0;
    this.yValue = 0;
    var checkBlockAction = this.checkBarrierCollision(); 
    switch (key) {
        case 'left':
            if (checkBlockAction !== 'cannot go left')
                this.x -= this.PLAYER_X_MOVE;
            this.xValue = - this.PLAYER_X_MOVE;
            break;
        case 'up':
            if (checkBlockAction !== 'cannot go up')
                this.y -= this.PLAYER_Y_MOVE;
            this.yValue -= this.PLAYER_Y_MOVE;
            break;
        case 'right':
            if (checkBlockAction !== 'cannot go right')
                this.x += this.PLAYER_X_MOVE;
            this.xValue = this.PLAYER_X_MOVE;
            break;
        case 'down':
            if(checkBlockAction !== 'cannot go down')
                this.y += this.PLAYER_Y_MOVE;
            this.yValue = this.PLAYER_Y_MOVE;
            break;

    }
}

Player.prototype.checkCollision = function () {
    //manage rock, gem and heart items
    if (app.allGameItems.size > 0) {
        app.allGameItems.forEach(function (item) {
            if (this.x === item.x && (item.y - this.y <= 5 && item.y - this.y >= 0)) {

                if (item instanceof Rock) {
                    //if item is a Rock, return player to previous position
                    //giving the efect of player being blocked by rock
                    this.x = this.x - this.xValue;
                    this.y = this.y - this.yValue;
                } else if (item instanceof Gem) {
                    //if item is gem, add points and delete gem from map
                    app.player.points += item.GEM_VALUE;
                    app.allGameItems.delete(item.key);
                } else if (item instanceof Heart) {                     
                    this.updateLife(true);
                    app.allGameItems.delete(item.key);
                }     
            }
        }, this);
    }
    for (var i = 0 ; i < app.allEnemies.length ; i++) {
        if (this.x < (app.allEnemies[i].x + 91) && (this.x + 91) > app.allEnemies[i].x &&
        this.y < (app.allEnemies[i].y + 73) && (this.y + 73) > app.allEnemies[i].y) {
            if (this.isCollided === false) {
                //decrease lives 
                this.isCollided = true;
                app.player.updateLife(false);
            }
        }
    }
}

Player.prototype.checkBarrierCollision = function () {
    var playerTop = this.y;
    var playerBottom = this.y + 73;
    var playerRight = this.x + 91;
    var playerLeft = this.x;
    var blockAction = "";
    for (var i = 0 ; i < allBarriers.length ; i++) {
        if (allBarriers[i].level === app.player.level) {
            if (playerLeft < allBarriers[i].right && playerRight > allBarriers[i].left && playerTop < allBarriers[i].bottom && playerBottom > allBarriers[i].top) {
                blockAction = 'cannot go up';
            }
        }
    }
    return blockAction;
}

Player.prototype.reset = function () {
    this.x = this.PLAYER_INIT_X_COORD;
    this.y = this.PLAYER_INIT_Y_COORD;
    this.isCollided = false;
};

Player.prototype.increaseLevel = function () {
    this.level++;
    this.points += 100;
    app.deleteHeartsGems();
    if (this.level === 11) {
        this.winGame = true;
        this.level = 10;
    }

    if (this.level % 2 === 0) {
        var heart = new Heart();
        app.allGameItems.set(heart.key, heart);
    }

    if (this.level > 4 && this.level % 2 === 1) {
        var gem = new Gem();
        app.allGameItems.set(gem.key, gem);
    }

    if (this.level % 3 === 0) {
        var rock = new Rock();
        app.allGameItems.set(rock.key, rock);
    }

    allEnemiesReset();
    app.createEnemies();
};

Player.prototype.updateLife = function (restart) {
    if (!restart) {
        this.lifes--;
        if (this.lifes === 0) {
            this.loseGame = true;
        }      
    } else {
        this.lifes++;
    }
};

// instantiate objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
app.allEnemies = [];
app.player = new Player();
app.createEnemies = function () {
    this.allEnemies.push(new Enemy());
};

app.createEnemies();

//Rocks, Gems and Hearts
var gameItem = function () {
    this.x = this.getRandomX();
    this.y = this.getRandomY();
    //create key to store item on map
    this.key = this.x.toString() + this.y.toString();
    this.checkCoords();
};

gameItem.prototype.getRandomX = function () {
    var num = 0;
    switch (Math.floor(Math.random() * 10)) {
        case 0:
            num = 0;
            break;
        case 1:
            num = 101;
            break;
        case 2:
            num = 202;
            break;
        case 3:
            num = 303;
            break;
        case 4:
            num = 404;
            break;
        case 5:
            num = 505;
            break;
        case 6:
            num = 606;
            break;
        case 7:
            num = 707;
            break;
        case 8:
            num = 808;
            break;
    }
    return num;
};

gameItem.prototype.getRandomY = function () {
    var num = 0;
    switch (app.getRandomNumber()) {
        case 0:
            num = 68;
            break;
        case 1:
            num = 151;
            break;
        default:
            num = 234;
    }
    return num;
};


//validates that another item doesn't have the same position
//if it does, new x and y coordenates are generated
//as well as a new key
gameItem.prototype.checkCoords = function () {

    while (app.allGameItems.has(this.key)) {
        this.x = this.getRandomX();
        this.y = this.getRandomY();
        this.key = this.x.toString() + this.y.toString();
    }
};

gameItem.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//create Heart for player to collect
var Heart = function () {
    this.sprite = 'images/Heart.png';
    gameItem.call(this);
};

Heart.prototype = Object.create(gameItem.prototype);
Heart.prototype.constructor = Heart;

//create Gem for player to collect,Gem has random colors
var Gem = function () {
    this.randomColor();
    gameItem.call(this);
};

Gem.prototype = Object.create(gameItem.prototype);
Gem.constructor = Gem;

Gem.prototype.randomColor = function () {
    var num = app.getRandomNumber();
    switch (num) {
        case 1:
            this.sprite = 'images/Gem-Blue.png';
            this.GEM_VALUE = 300;
            break;
        case 1:
            this.sprite = 'images/Gem-Orange.png';
            this.GEM_VALUE = 200;
            break;
        default:
            this.sprite = 'images/Gem-Green.png';
            this.GEM_VALUE = 100;
            break;
    }
};

var Rock = function () {
    this.sprite = 'images/Rock.png';
    gameItem.call(this);
};

Rock.prototype = Object.create(gameItem.prototype);
Rock.prototype.constructor = Rock;

//Class for happy characters that appear at the end of game
var HappyCharacter = function (x, y, image) {
    this.x = x;
    this.y = y;
    this.originalY = y;
    this.sprite = image;
    this.up = true;
};

// The freed characters express their gratitude and excitement by jumping up and down.
HappyCharacter.prototype.update = function (dt) {
    if ((this.up === true) && (this.y > (this.originalY - 34))) {
        this.y -= 2; // Keep going up
    } else if (this.y == (this.originalY - 34)) {
        this.y += 2; // Start going down
        this.up = false;
    } else if ((this.up === false) && (this.y > (this.originalY - 34)) && (this.y < this.originalY)) {
        this.y += 2; // Keep going down
    } else if (this.y == this.originalY) {
        this.y -= 2; // Start going up
        this.up = true; // Set to true after finishing downward movement
    }
};

// Happy characters are rendered with separate shadow images (which will remain static as characters jump and down)
HappyCharacter.prototype.render = function () {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(Resources.get('images/win/round-shadow-02.png'), this.x + 30, this.originalY + 130);
    ctx.globalAlpha = 1;
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

//Class for happy characters that appear at the end of game
var Item = function (startingX, image) {
    this.left = startingX;
    this.sprite = image;
    this.originalX = startingX;
    this.goingRight = true;
};

// This is a method for specifying movements for certain items like the bobbing bottle and hearts.
Item.prototype.update = function (dt) {
    
    if (this.sprite === 'images/win/mini-heart.png') {
        if ((this.goingRight === true) && (this.left < (this.originalX + 60)) && (this.top > -1)) {
            // The mini heart keeps going right
            this.left += 4;
            // The mini heart keeps going up
            this.top -= 400 * dt;
        }
            // The mini heart begins going left while continuing its upward movement
        else if ((this.left == (this.originalX + 60)) && (this.top >= 20)) {
            this.left -= 4;
            this.goingRight = false;
            this.top -= 400 * dt;
        }
            // The mini heart continues going left and up
        else if ((this.goingRight === false) && (this.left > (this.originalX - 60)) && (this.top > -1)) {
            this.left -= 4;
            this.top -= 400 * dt;
        }
            // The mini heart begins going to the right, while continuing to go up.
        else if ((this.left == this.originalX - 60) && (this.top > -1)) {
            this.left += 4;
            this.goingRight = true;
            this.top -= 400 * dt;
        }
        else {
            this.top = Math.random() * 550 - Math.random() * 50;
        }
    }
        // These mini hearts move in the same way as the mini hearts above, but in the opposite direction while going up the canvas.
    else if (this.sprite === 'images/win/mini-heart-02.png') {
        if ((this.goingRight === true) && (this.left > (this.originalX - 60)) && (this.top > -1)) {
            this.left -= 4;
            this.top -= 400 * dt;
        } else if ((this.left == (this.originalX - 60)) && (this.top >= 20)) {
            this.left += 4;
            this.goingRight = false;
            this.top -= 400 * dt;// going up
        } else if ((this.goingRight === false) && (this.left < (this.originalX + 60)) && (this.top > -1)) {
            this.left += 4; //keep going right
            this.top -= 400 * dt;// going up
        } else if ((this.left == this.originalX + 60) && (this.top > -1)) {
            this.left -= 4; //start going left
            this.goingRight = true; //set to true after finishing going right
            this.top -= 400 * dt;// going up
        } else {
            this.top = Math.random() * 550 - Math.random() * 50;
        }
    }
};

Item.prototype.render = function () {
    ctx.drawImage(Resources.get(this.sprite), this.left, this.top);
};

var allHappyCharacters = [];

allHappyCharacters.push(new HappyCharacter(250, 210, 'images/win/char-cat-girl-no-shadow.png'));
allHappyCharacters.push(new HappyCharacter(350, 250, 'images/win/char-horn-girl-no-shadow.png'));
allHappyCharacters.push(new HappyCharacter(450, 250, 'images/win/char-pink-girl-no-shadow.png'));
allHappyCharacters.push(new HappyCharacter(550, 210, 'images/win/char-princess-girl-no-shadow.png'));

var allHappyHearts = [];

allHappyHearts.push(new Item(450,'images/win/mini-heart.png'));
allHappyHearts.push(new Item(250, 'images/win/mini-heart-02.png'));
allHappyHearts.push(new Item(400, 'images/win/mini-heart.png'));
allHappyHearts.push(new Item(300, 'images/win/mini-heart-02.png'));
allHappyHearts.push(new Item(520, 'images/win/mini-heart.png'));
allHappyHearts.push(new Item(320, 'images/win/mini-heart-02.png'));
allHappyHearts.push(new Item(550, 'images/win/mini-heart.png'));
allHappyHearts.push(new Item(250, 'images/win/mini-heart-02.png'));
allHappyHearts.push(new Item(600, 'images/win/mini-heart.png'));


//Barrier class for barriers
var Barrier = function (x, y, width, height, level, image, type) {
    this.left = x;
    this.top = y;
    this.right = x + width;
    this.bottom = y + height;
    this.width = width;
    this.height = height;
    this.level = level;
    this.sprite = image;
};

var allBarriers = [];

//Add metals to prevent player from going on in diffrents levels
allBarriers.push(new Barrier(0, 87, 101, 45, 2, 'images/metal-fence.png'));

allBarriers.push(new Barrier(0, 87, 101, 45, 3, 'images/metal-fence.png'));
allBarriers.push(new Barrier(101, 87, 101, 45, 3, 'images/metal-fence.png'));

allBarriers.push(new Barrier(0, 87, 101, 45, 4, 'images/metal-fence.png'));
allBarriers.push(new Barrier(101, 87, 101, 45, 4, 'images/metal-fence.png'));
allBarriers.push(new Barrier(808, 87, 101, 45, 4, 'images/metal-fence.png'));

for (var i = 5 ; i <= 10 ; i++) {
    allBarriers.push(new Barrier(0, 87, 101, 45, i, 'images/metal-fence.png'));
    allBarriers.push(new Barrier(101, 87, 101, 45, i, 'images/metal-fence.png'));
    allBarriers.push(new Barrier(808, 87, 101, 45, i, 'images/metal-fence.png'));
    allBarriers.push(new Barrier(606, 87, 101, 45, i, 'images/metal-fence.png'));
}


