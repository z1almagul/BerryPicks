window.addEventListener('load',function(){
    //canvas setup
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    class InputHandler{
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', e => {
                if(this.game.player.y === this.game.height - this.game.player.height)
                if(e.key === ' ' && this.game.keys.indexOf(e.key) === -1)
                    this.game.keys.push(e.key);
            });
            window.addEventListener('keyup', e => {
                if(this.game.keys.indexOf(e.key) > -1){
                    this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
                    this.game.player.speedY = this.game.player.maxSpeed;}
            });
            window.addEventListener("touchstart", e=>{
                if(this.game.player.y === this.game.height - this.game.player.height)
                    this.game.keys.push(' ');
            });
            window.addEventListener("touchcancel", e=>{
                if(this.game.keys.indexOf(' ') > -1){
                    this.game.keys.splice(this.game.keys[0], 1);
                    this.game.player.speedY = this.game.player.maxSpeed;
                }
            });
        }
    }

    class Player{
        constructor(game){
            this.game = game;
            this.width = 50;
            this.height = 100;
            this.x = 20;
            this.y = this.game.height - this.height;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 1;
            this.speedY = 0;
            this.maxSpeed = 2;
            this.image = document.getElementById('player');
            this.powerUp = false;
            this.powerUpTimer = 0;
            this.powerUpLimit = 10000;
        }

        update(deltaTime){
            //moving the player
            if(this.game.keys.includes(' ')){                
                this.speedY = -this.maxSpeed * 5;
                this.y += this.speedY;
            }else {this.speedY = this.maxSpeed;
                    this.y +=this.speedY;
            }
            //bottom boundary
            if(this.y > this.game.height - this.height)
                this.y = this.game.height - this.height;
            //top boundary
                else if(this.y < this.game.height - 2.5 * this.height)
                    this.y = this.game.height - 2.5 * this.height;           
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
        }

        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            //condition
            this.game.gameWon = true;
        }
    }

    class Barrier{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.frameX = 0;
            this.frameY = 0;
            this.markedForDeletion = false;
            this.speedX = Math.random() * -1.5 - 0.5;

        }

        update(){
            this.x += this.speedX - this.game.speed;
            if(this.x + this.width < 0)
                this.markedForDeletion = true;
        }

        draw(context){
            context.drawImage(this.image, this.x, this.y);
        }
    }

    class Cone extends Barrier{
        constructor(game){
            super(game);
            this.width = 30;
            this.height = 50;
            this.y = this.game.height - this.height;
            this.image = document.getElementById('cone');
            this.score = 1;
        }
    }

    class Car extends Barrier{
        constructor(game){
            super(game);
            this.width = 100;
            this.height = 65;
            this.y = this.game.height - this.height;
            this.image = document.getElementById('car');
            this.score = 3;
        }
    }

    class Can extends Barrier{
        constructor(game){
            super(game);
            this.width = 40;
            this.height = 60;
            this.y = this.game.height - this.height;
            this.image = document.getElementById('can');
            this.score = 2;
        }
    }

    class Cat extends Barrier{
        constructor(game){
            super(game);
            this.width = 30;
            this.height = 45;
            this.y = this.game.height - this.height; 
            this.image = document.getElementById('cat');
            this.score = 10;
            this.type = 'cat';
        }
    }

    class Background{
        constructor(game){
            this.game = game;
            //get images by id;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            //create new layers
            this.layer1 = new Layer(this.game, this.image1, 0.2);
            this.layer2 = new Layer(this.game, this.image2, 0.4);
            this.layer3 = new Layer(this.game, this.image3, 0.8);
            this.layers = [this.layer1, this.layer2, this.layer3];
        }

        update(){
            this.layers.forEach(layer => layer.update());
        }

        draw(context){
            this.layers.forEach(layer => layer.draw(context));
        }
    }

    class Layer{
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1200;
            this.height = 500;
            this.x = 0;
            this.y = 0;
        }

        update(){
            if(this.x <= -this.width) this.x = 0;
            else this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    }

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Calibri';
            this.color = 'purple';
        }

        draw(context){
            context.save();
            //display score
            context.fillStyle=this.color;
            context.font = this.fontSize + 'px ' + this.fontFamily;
            context.fillText('Cats Saved: ' + this.game.catsSaved, 20, 40);
            //display time
            const formattedTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Time: ' + formattedTime, 20, 70);
            //game over message
            if(this.game.gameOver){
                context.textAlign = 'center';
                let message1, message2;
                if(this.game.catsSaved === 10){
                    message1 = "You won!"
                    message2 = "Refresh to replay."
                }else{
                    message1 = 'You lost!';
                    message2 = 'Refresh to try again!';
                }
                
                context.font = '50px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 40);
                context.font = '25px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 40);
            }
            
            context.restore();
        }
    }

    class Game{
        constructor(width, height){
            this.width = width;
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.keys = [];
            this.barriers = [];
            this.barrierTimer = 0;
            this.barrierInterval = 5000;
            this.gameOver = false;
            this.gameTime = 0;
            this.score = 0;
            this.winningScore = 500; 
            this.speed = 1;
            this.catsSaved = 0;
        }

        update(deltaTime){
            if(!this.gameOver) this.gameTime += deltaTime;
            this.background.update();
            //this.background.layer3.update(); // the frontier layer
            this.player.update(deltaTime);
            this.barriers.forEach(barrier => {
                barrier.update();
                if(this.checkCollision(this.player, barrier)){
                    barrier.markedForDeletion = true;
                    if(barrier.type === 'cat')
                        this.catsSaved++;
                    else this.gameOver = true;
                }
                        
            });
            this.barriers = this.barriers.filter(barrier => !barrier.markedForDeletion);
            if(this.barrierTimer > this.barrierInterval && !this.gameOver){
                this.addBarrier();
                this.barrierTimer = 0;
            }else this.barrierTimer += deltaTime;
        }

        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.barriers.forEach(barrier => {
                barrier.draw(context);
            });
        }      

        addBarrier(){
            const randomize = Math.random();
            if(randomize < 0.3)
                this.barriers.push(new Cone(this));
            else if(randomize < 0.6) this.barriers.push(new Can(this));
            else if(randomize < 0.9) this.barriers.push(new Car(this));
            else this.barriers.push(new Cat(this));
        }

        checkCollision(rect1, rect2){
            return(rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y)
        }
    }

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;
    //animation loop
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        game.update(deltaTime);
        game.draw(ctx);
        requestAnimationFrame(animate);
    }
    animate(0);
});
