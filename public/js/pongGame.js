// Global Variables
var DIRECTION = {
    IDLE: 0,
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4
};

var rounds = [2];
var colors = ['#4ea694', '#2ecc71', '#3498db', '#e74c3c', '#9b59b6'];

// The ball object (The cube that bounces back and forth)
var Ball = {
    new: function (incrementedSpeed) {
        return {
            width: 18,
            height: 18,
            x: (this.canvas.width / 2),
            y: (this.canvas.height / 2),
            moveX: DIRECTION.IDLE,
            moveY: DIRECTION.IDLE,
            speed: incrementedSpeed || 9
        };
    }
};

// The paddle object (The two lines that move up and down)
var Paddle = {
    new: function (side) {
        return {
            width: 18,
            height: 70,
            x: side === 'left' ? 150 : this.canvas.width - 150,
            y: (this.canvas.height / 2) - 35,
            score: 0,
            move: DIRECTION.IDLE,
            speed: 10
        };
    }
};


var Game = {

    initialize: function (side) {
        this.canvas = document.querySelector('canvas');
        this.context = this.canvas.getContext('2d');

        this.canvas.width = 1300;
        this.canvas.height = 800;

        this.canvas.style.width = "100%";

        this.player = Paddle.new.call(this, 'left');
        this.paddle = Paddle.new.call(this, 'right');
        if (side == 'right') { this.turn = this.paddle; } else if (side == 'left') { this.turn = this.player; }

        this.ball = Ball.new.call(this);

        this.running = this.over = false;
        this.timer = this.round = 0;
        this.color = this._generateRoundColor();

        if (side != null) {
            var counter = 3;

            var id = setInterval(function () {
                Pong.menu(counter);
                if (counter == 0) {
                    clearInterval(id);
                }
                counter--;
            }, 1000);

            Pong.listen();
        }
        else {
            Pong.menu();
        }

    },

    endGameMenu: function (text) {
        // Change the canvas font size and color
        Pong.context.font = '50px Courier New';
        Pong.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        Pong.context.fillRect(
            Pong.canvas.width / 2 - 350,
            Pong.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        Pong.context.fillStyle = '#ffffff';

        // Draw the end game menu text ('Game Over' and 'Winner')
        Pong.context.fillText(text,
            Pong.canvas.width / 2,
            Pong.canvas.height / 2 + 15
        );

        setTimeout(function () {
            Pong = Object.assign({}, Game);
            //Pong.initialize();
        }, 1000);
        setTimeout(3000);

        callMessageBoxForKeepPlaying();
    },

    menu: function (counter) {
        // Draw all the Pong objects in their current state
        Pong.draw();

        // Change the canvas font size and color
        this.context.font = '50px Courier New';
        this.context.fillStyle = this.color;

        // Draw the rectangle behind the 'Press any key to begin' text.
        this.context.fillRect(
            this.canvas.width / 2 - 350,
            this.canvas.height / 2 - 48,
            700,
            100
        );

        // Change the canvas color;
        this.context.fillStyle = '#ffffff';

        if (counter != null) {
            // Draw the 'press any key to begin' text
            this.context.fillText(counter == 0 ? "" : counter,
                this.canvas.width / 2,
                this.canvas.height / 2 + 15
            );

            if (counter == 0 && this.running == false) {
                Pong.running = true;
                window.requestAnimationFrame(Pong.loop);
            }
        }
        else {
            this.context.fillText("Rakip Aranıyor..",
                this.canvas.width / 2,
                this.canvas.height / 2 + 15
            );
        }



    },

    // Update all objects (move the player, paddle, ball, increment the score, etc.)
    update: function () {
        if (!this.over) {
            $('.leftpaddleinfo').text("Speed : " + this.player.speed + " Y : " + this.player.y);
            $('.rightpaddleinfo').text("Speed : " + this.paddle.speed + " Y : " + this.paddle.y);
            // If the ball collides with the bound limits - correct the x and y coords.
            if (this.ball.x <= 0) {
                socket.emit('sendYouWonDataToEnemy', ''); 
                this.ball.moveX = DIRECTION.IDLE;
                Pong._resetTurn.call(this, this.paddle, this.player);
            }
            if (this.ball.x >= this.canvas.width - this.ball.width) {
                this.ball.moveX = DIRECTION.IDLE;
                Pong._resetTurn.call(this, this.player, this.paddle);
            }
            if (this.ball.y <= 0) this.ball.moveY = DIRECTION.DOWN;
            if (this.ball.y >= this.canvas.height - this.ball.height) this.ball.moveY = DIRECTION.UP;

            // Move player if they player.move value was updated by a keyboard event
            if (this.player.move === DIRECTION.UP) this.player.y -= this.player.speed;
            else if (this.player.move === DIRECTION.DOWN) this.player.y += this.player.speed;


            // Move player2 if they player2.move value was updated by a keyboard event
            if (this.paddle.move === DIRECTION.UP) this.paddle.y -= this.paddle.speed;
            else if (this.paddle.move === DIRECTION.DOWN) this.paddle.y += this.paddle.speed;

            // On new serve (start of each turn) move the ball to the correct side
            // and randomize the direction to add some challenge.
            if (Pong._turnDelayIsOver.call(this) && this.turn) {
                this.ball.moveX = this.turn === this.player ? DIRECTION.LEFT : DIRECTION.RIGHT;
                this.ball.moveY = [DIRECTION.UP, DIRECTION.DOWN][0];
                this.ball.y = Math.floor(1 * this.canvas.height - 200) + 200;
                this.turn = null;
            }

            // If the player collides with the bound limits, update the x and y coords.
            if (this.player.y <= 0) this.player.y = 0;
            else if (this.player.y >= (this.canvas.height - this.player.height)) this.player.y = (this.canvas.height - this.player.height);

            // If the player2 collides with the bound limits, update the x and y coords.
            if (this.paddle.y <= 0) this.paddle.y = 0;
            else if (this.paddle.y >= (this.canvas.height - this.paddle.height)) this.paddle.y = (this.canvas.height - this.paddle.height);

            // Move ball in intended direction based on moveY and moveX values
            if (this.ball.moveY === DIRECTION.UP) this.ball.y -= (this.ball.speed / 1.5);
            else if (this.ball.moveY === DIRECTION.DOWN) this.ball.y += (this.ball.speed / 1.5);
            if (this.ball.moveX === DIRECTION.LEFT) {
                this.ball.x -= this.ball.speed;
            }
            else if (this.ball.moveX === DIRECTION.RIGHT) {
                this.ball.x += this.ball.speed;
            }

            // Handle paddle (AI) UP and DOWN movement
            //if (this.paddle.y > this.ball.y - (this.paddle.height / 2)) {
            //	if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y -= this.paddle.speed / 1.5;
            //	else this.paddle.y -= this.paddle.speed / 4;
            //}
            //if (this.paddle.y < this.ball.y - (this.paddle.height / 2)) {
            //	if (this.ball.moveX === DIRECTION.RIGHT) this.paddle.y += this.paddle.speed / 1.5;
            //	else this.paddle.y += this.paddle.speed / 4;
            //}

            //// Handle paddle (AI) wall collision
            //if (this.paddle.y >= this.canvas.height - this.paddle.height) this.paddle.y = this.canvas.height - this.paddle.height;
            //else if (this.paddle.y <= 0) this.paddle.y = 0;

            if(this.ball.x < this.player.x && this.ball.x > this.player.x - 10)
            {
                socket.emit('sendSyncBallDataToEnemy', Pong.ball); 
            }

            // Handle Player-Ball collisions
            if (this.ball.x - this.ball.width <= this.player.x && this.ball.x >= this.player.x - this.player.width) {
                if (this.ball.y <= this.player.y + this.player.height && this.ball.y + this.ball.height >= this.player.y) {
                    this.ball.x = (this.player.x + this.ball.width);
                    this.ball.moveX = DIRECTION.RIGHT;
                    socket.emit('sendSyncBallDataToEnemy', Pong.ball); 
                    //beep1.play();
                }
            }

            // Handle paddle-ball collision
            if (this.ball.x - this.ball.width <= this.paddle.x && this.ball.x >= this.paddle.x - this.paddle.width) {
                if (this.ball.y <= this.paddle.y + this.paddle.height && this.ball.y + this.ball.height >= this.paddle.y) {
                    this.ball.x = (this.paddle.x - this.ball.width);
                    this.ball.moveX = DIRECTION.LEFT;
                    //beep1.play();
                }
            }

        }

        // Handle the end of round transition
        // Check to see if the player won the round.
        if (this.player.score === 6) {
            // Check to see if there are any more rounds/levels left and display the victory screen if
            // there are not.
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Winner!'); }, 100);
        }
        // Check to see if the paddle/AI has won the round.
        else if (this.paddle.score === 6) {
            this.over = true;
            setTimeout(function () { Pong.endGameMenu('Game Over!'); }, 100);
        }

    },

    drawPlayersNames: function (userPlayer = '_____', enemyPlayer = '_____') {
        // Draw the winning score (center)
        this.context.font = '22px Courier New';
        this.context.fillText(
            userPlayer + ' vs ' + enemyPlayer,
            (this.canvas.width / 2),
            35
        );
    },

    // Draw the objects to the canvas element
    draw: function () {
        // Clear the Canvas
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Set the fill style to black
        this.context.fillStyle = this.color;

        // Draw the background
        this.context.fillRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // Set the fill style to white (For the paddles and the ball)
        this.context.fillStyle = '#ffffff';

        // Draw the Player
        this.context.fillRect(
            this.player.x,
            this.player.y,
            this.player.width,
            this.player.height
        );

        // Draw the Paddle
        this.context.fillRect(
            this.paddle.x,
            this.paddle.y,
            this.paddle.width,
            this.paddle.height
        );

        // Draw the Ball
        if (Pong._turnDelayIsOver.call(this)) {
            this.context.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }

        // Draw the net (Line in the middle)
        this.context.beginPath();
        this.context.setLineDash([7, 15]);
        this.context.moveTo((this.canvas.width / 2), this.canvas.height - 140);
        this.context.lineTo((this.canvas.width / 2), 140);
        this.context.lineWidth = 10;
        this.context.strokeStyle = '#ffffff';
        this.context.stroke();

        // Set the default canvas font and align it to the center
        this.context.font = '100px Courier New';
        this.context.textAlign = 'center';

        // Draw the players score (left)
        this.context.fillText(
            this.player.score.toString(),
            (this.canvas.width / 2) - 300,
            200
        );

        // Draw the paddles score (right)
        this.context.fillText(
            this.paddle.score.toString(),
            (this.canvas.width / 2) + 300,
            200
        );

        // Change the font size for the center score text
        this.context.font = '30px Courier New';

        // Change the font size for the center score value
        this.context.font = '40px Courier';

        // Draw the current round number
        this.context.fillText(
            rounds[Pong.round] ? rounds[Pong.round] : rounds[Pong.round - 1],
            (this.canvas.width / 2),
            100
        );
    },

    loop: function () {
        Pong.update();
        Pong.draw();


        // If the game is not over, draw the next frame.
        if (!Pong.over) {
            requestAnimationFrame(Pong.loop);

            var t0 = performance.now();

            do {

                var t1 = performance.now();

            } while (t1 - t0 < 15);


        }
    },

    listen: function () {
        var counter = 0;
        document.addEventListener('keydown', function (key) {
            // Handle the 'Press any key to begin' function and start the game.
            if (Pong.running === false) {
                //Pong.initialize('left');
                //Pong.running = true;
                //window.requestAnimationFrame(Pong.loop);
            }

            //counter++;

            // Handle up arrow and w key events
            if (key.keyCode === 38 || key.keyCode === 37) {
                Pong.player.move = DIRECTION.UP;
            };

            // Handle down arrow and s key events
            if (key.keyCode === 40 || key.keyCode === 39) {
                Pong.player.move = DIRECTION.DOWN;
            };

            if (Pong.running === true) {
                socket.emit('sendPlayerPongDataToEnemy', Pong.player); 
                //connection.invoke("SendGameDataToRoom", "", "playerData", JSON.stringify(Pong.player));

                //if (counter == 8) { connection.invoke("SendGameDataToRoom", "", "syncBallData", JSON.stringify(Pong.ball)); counter = 0; }
            }
            else {
                //connection.invoke("SendGameDataToRoom", "", "readyState", "");
            }
        });

        // Stop the player from moving when there are no keys being pressed.
        document.addEventListener('keyup', function (key) {

            //counter++;

            Pong.player.move = DIRECTION.IDLE;
            if (Pong.running === true) {
                
                socket.emit('sendPlayerPongDataToEnemy', Pong.player); 
                //connection.invoke("SendGameDataToRoom", "", "playerData", JSON.stringify(Pong.player));

                //if (counter == 8) { connection.invoke("SendGameDataToRoom", "", "syncBallData", JSON.stringify(Pong.ball)); counter = 0; }
            }
            else {
                //connection.invoke("SendGameDataToRoom", "", "readyState", "");
            }
        });
    },

    // Reset the ball location, the player turns and set a delay before the next round begins.
    _resetTurn: function (victor, loser) {
        this.ball = Ball.new.call(this, this.ball.speed);
        this.turn = loser;
        this.timer = (new Date()).getTime();
        victor.score++;
        //connection.invoke("SendGameMessage", "ben : " + this.player.score + " sen : " + this.paddle.score);
        //beep2.play();
    },

    // Wait for a delay to have passed after each turn.
    _turnDelayIsOver: function () {
        return (setTimeout(function () {  }, 1000));
    },

    // Select a random color as the background of each level/round.
    _generateRoundColor: function () {
        var newColor = colors[0];
        //if (newColor === this.color) return Pong._generateRoundColor();
        return newColor;
    }
};

var Pong = Object.assign({}, Game);
Pong.initialize();