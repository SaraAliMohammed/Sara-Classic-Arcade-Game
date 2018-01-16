/* Engine.js
 * This file provides the game loop functionality (update entities and render),

 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.

 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */
"use strict";

var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 909;
    canvas.height = 606;

    $("#game").append(canvas);

    // This listens for key presses and sends the keys to 
    // Player.handleInput() method.
    document.addEventListener('keyup', function (e) {
        var allowedKeys = {
            37: 'left',
            38: 'up',
            39: 'right',
            40: 'down'
        };

        //press p to pause or restart game 
        if ((e.keyCode == 80) && (app.gamePaused === true)) {
            app.gamePaused = false;
            app.gameUnPaused = true;
            win.requestAnimationFrame(main);
        } else if (e.keyCode == 80) {
            app.gamePaused = true;
        }

        if (app.gamePaused !== true)
            app.player.handleInput(allowedKeys[e.keyCode]);

        if ((e.keyCode == 13) && app.player.loseGame === true) {
            app.restartGame();
            win.requestAnimationFrame(main);
        }else if((e.keyCode == 13) && (app.player.winGame == true)){
            app.restartGame();
        }
    });

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if the game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is)
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */

        if (app.gameUnPaused === true) {
            update(0);
            app.gameUnPaused = false;
        } else {
            update(dt);
        }

        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */

        if (!app.player.winGame) {
            /* Show message on game over */
            if (app.player.loseGame === true) {
                setTimeout(function () {
                    ctx.font = '23pt Arial';
                    ctx.globalAlpha = 0.65;
                    ctx.fillStyle = 'black';
                    ctx.fillRect(278, 200, 350, 200);
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = 'yellow';
                    ctx.fillText('GAME OVER!', 355, 285);
                    ctx.font = '18pt Arial';
                    ctx.fillStyle = 'white';
                    ctx.fillText('Press Enter to Play Again', 317, 350);//117
                }, 50);
            } else if (app.player.isCollided === true) {
                app.player.reset();
                allEnemiesReset();

                /* Use the browser's requestAnimationFrame function to call this
                 * function again as soon as the browser is able to draw another frame.
                 */
                setTimeout(function () {
                    win.requestAnimationFrame(main);
                }, 500);
            } else if (app.gamePaused === false) {
                win.requestAnimationFrame(main);
            }
        }
        else if (app.player.winGame) {
            /* Show happy characters when player win the game */
            ctx.font = '27pt Arial';
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            allHappyCharacters.forEach(function (char) {
                char.render();
            });
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'black';
            ctx.fillRect(278, 400, 355, 138);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ede715';
            ctx.fillText('YOU DID IT!!!', 345, 455);
            ctx.font = '17pt Arial';
            ctx.fillStyle = 'white';
            ctx.fillText('Press Enter to Play Again', 335, 490);
            allHappyHearts.forEach(function (heart) {
                heart.render();
            });
            
            win.requestAnimationFrame(main);
        }

        
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die)
     */
    function update(dt) {
        updateEntities(dt);  
    }

    /* This is called by the update function and loops through all of the
     * objects within allEnemies array and calls
     * their update() methods. It will then call the update function for
     * player object. These update methods should focus purely on updating
     * the data/properties related to the object.
     */
    function updateEntities(dt) {
        if (app.player.winGame !== true) {
            app.allEnemies.forEach(function (enemy) {
                enemy.update(dt);
            });
            app.player.update();
        } else {
            // Happy Characters come out and jump up and down when game is completed
            allHappyCharacters.forEach(function (char) {
                char.update(dt);
            });
            // Mini hearts move left and right while floating up the canvas
            allHappyHearts.forEach(function (heart) {
                heart.update(dt);
            });
        }
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. This function is called every
     * game tick (or loop of the game engine)
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        var rowImages = [
                'images/water-block.png',   // Top row is water
                'images/stone-block.png',   // Row 1 of 3 of stone
                'images/stone-block.png',   // Row 2 of 3 of stone
                'images/stone-block.png',   // Row 3 of 3 of stone
                'images/grass-block.png',   // Row 1 of 2 of grass
                'images/grass-block.png'    // Row 2 of 2 of grass
            ],
            numRows = 6,
            numCols = 9,
            row, col;
        
        // Before drawing, clear existing canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)

        /* Loop through the number of rows and columns we've defined above
         * and, using the rowImages array, draw the correct image for that
         * portion of the "grid"
         */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* The drawImage function of the canvas' context element
                 * requires 3 parameters: the image to draw, the x coordinate
                 * to start drawing and the y coordinate to start drawing.
                 * We're using our Resources helpers to refer to our images
                 * so that we get the benefits of caching these images, since
                 * we're using them over and over.
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        /*Show Press p to pause or resume message*/
        ctx.font = '12.5pt Arial';
        ctx.fillStyle = 'white';
        ctx.globalAlpha = 0.7;
        ctx.fillText('Press p to pause or resume', 690, 572);
        ctx.globalAlpha = 1;

        /*Show player points, lifes and level*/
        ctx.font = '20pt Arial';
        ctx.fillStyle = 'lightgray';
        ctx.rect(0, 0, 909, 50);
        ctx.fill();
        ctx.fillStyle = '#0192B5';
        ctx.fillText(app.player.points + ' pts', 125, 30);
        ctx.fillText('Level ' + app.player.level, 420, 30);
        ctx.drawImage(Resources.get('images/Heart-mini-03-thicker-white-outline.png'), 720, 10);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 4;
        ctx.strokeText('x', 760, 30);
        ctx.strokeText(app.player.lifes, 790, 32);
        ctx.fillStyle = 'black';
        ctx.fillText('x', 760, 30);
        ctx.fillText(app.player.lifes, 790, 32);
        
        /*Draw barriers*/
        for (var i = 0; i < allBarriers.length; i++) {
            if ((app.player.level == allBarriers[i].level)) {
                ctx.drawImage(Resources.get(allBarriers[i].sprite), allBarriers[i].left, allBarriers[i].top);
            }
        }

        renderEntities();
    }

    /* This function is called by the render function and is called on each game
     * tick.*/
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function.
         */

        if (app.player.winGame !== true) {
            app.allGameItems.forEach(function (item) {
                item.render();
            });

            app.allEnemies.forEach(function (enemy) {
                enemy.render();
            });

            app.player.render();
        }
        
    }

    /* Load all of the images */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-boy-sad.png',
        'images/Heart-mini-03-thicker-white-outline.png',
        'images/win/round-shadow-02.png',
        'images/win/char-cat-girl-no-shadow.png',
        'images/win/char-horn-girl-no-shadow.png',
        'images/win/char-pink-girl-no-shadow.png',
        'images/win/char-princess-girl-no-shadow.png',
        'images/win/mini-heart.png',
        'images/win/mini-heart-02.png',
        'images/metal-fence.png',
        'images/Rock.png',
        'images/Heart.png',
        'images/Gem-Blue.png',
        'images/Gem-Orange.png',
        'images/Gem-Green.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable */
    global.ctx = ctx;
})(this);
