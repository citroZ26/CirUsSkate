let gameOptions = {
    // plage de vitesse de la plateform, en pixels par seconde
    platformSpeedRange: [300, 300],

    // spawn range, à quelle distance doit être la plate-forme la plus à droite du bord droit
    // before next platform spawns, in pixels
    spawnRange: [300, 300],

    // plage de spawn, how far should be the rightmost platform from the right edge
    // avant que la prochaine plateform apparaisse, en pixels
    platformStartSpeed: 350,

    // largeur de la plate-forme, en pixels
    platformSizeRange: [688, 688],

    // une plage haute entre la plateforme la plus à droite et la prochaine plateforme à engendrer
    platformHeightRange: [-4, 4],

    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 100,

    // hauteur maximale et minimale de la plate-forme, en tant que rapport de hauteur d'écran
    platformVerticalLimit: [0.75, 0.95],

    // % of probability a coin appears on the platform
    coinPercent: 75,

    playerStartPosition: 200,
    playerGravity: 900,
    jumpForce: 900,
    jumps: 1,
    counter: 0,
    bestScore: 37,
    nbrCoin: 0
}

var jumpMusic;
var gameoverMusic;
var buttonRestart;
var keySpace;
var background;
var animation;
var button;
var player;
var clock;
var spark;
var fall = false;
var scoreText;
var isJumped = 0;
var skate;
var xText;
var graphics;
var theme;
var coinSound;
var congratulation;
var bestScore = 2;



class playGame extends Phaser.Scene {


    constructor() {
        super("PlayGame");
    }

    create() {

        console.log(this.scene);

        gameOptions.counter = 0; // Score à 0
        gameOptions.nbrCoin = 0;
        gameOptions.platformStartSpeed = 500;
        fall = false;

        // keeping track of added platforms
        this.addedPlatforms = 0;

        //audio
        jumpMusic = this.sound.add('jump');
        gameoverMusic = this.sound.add('gameover');
        theme = this.sound.add('theme');
        coinSound = this.sound.add('coin');
        congratulation = this.sound.add('congratulation');
        theme.play();

        //temps
        clock = this.plugins.get('rexClock').add(this, {});
        clock.start();

        //background
        background = this.add.tileSprite(0,0,0,0,'blueBackground').setOrigin(0,0);

        // groupe platforms
        this.platformGroup = this.add.group({
            removeCallback: function (platform) {
                platform.scene.platformPool.add(platform)
            }
        });

        // pool
        this.platformPool = this.add.group({
            removeCallback: function (platform) {
                platform.scene.platformGroup.add(platform)
            }
        });

        // groupe poubelles
        this.poubelleGroup = this.add.group({});

        // groupe barrieres
        this.barriereGroup = this.add.group({});
        
        // groupe incendie
        this.incendieGroup = this.add.group({});

        // group with all active coins.
        this.coinGroup = this.add.group({

            // once a coin is removed, it's added to the pool
            removeCallback: function(coin){
                coin.scene.coinPool.add(coin)
            }
        });

        // coin pool
        this.coinPool = this.add.group({

            // once a coin is removed from the pool, it's added to the active coins group
            removeCallback: function(coin){
                coin.scene.coinGroup.add(coin)
            }
        });


        // ajouter une platform
        this.addPlatform(game.config.width, game.config.width / 2, game.config.height * gameOptions.platformVerticalLimit[1]);

        // Ajout du joueur
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, 'player');
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);
        this.player.setSize(70, 240, false).setOffset(60, 0);

        //animations
        var frameStart = this.anims.generateFrameNames('start');
        this.anims.create({key: 'start', frames: frameStart, frameRate: 22, repeat: 0});
        this.player.anims.play('start');

        var frameSkate = this.anims.generateFrameNames('skate');
        this.anims.create({key: 'skate', frames: frameSkate, frameRate: 22, repeat: -1});

        var frameSimpleJump = this.anims.generateFrameNames('simpleJump');
        this.anims.create({key: 'simpleJump', frames: frameSimpleJump, frameRate: 16});

        var frameJump = this.anims.generateFrameNames('jump');
        this.anims.create({key: 'jump', frames: frameJump, frameRate: 11});

        var frameFall = this.anims.generateFrameNames('fall');
        this.anims.create({key: 'fall', frames: frameFall, frameRate: 18});

        var frameSpark = this.anims.generateFrameNames('spark');
        this.anims.create({key: 'spark', frames: frameSpark, frameRate: 10, repeat: -1});
        
        var rect = new Phaser.Geom.Rectangle(game.config.width / 2 - 100, 0, 200, 75);
        graphics = this.add.graphics({ fillStyle: { color: 0x666666, alpha: 0.8 } });
        graphics.fillRectShape(rect);

        //score en jeux
        xText = this.add.text(game.config.width / 2 - 15, 20, 'x', {
            font: '50px',
            fill: 'yellow',
            color: 'yellow',
            align: 'center',
            alpha: 1
        });
        scoreText = this.add.text(game.config.width / 2 + 30, 0, 'X', {
            font: '80px',
            fill: 'yellow',
            color: 'yellow',
            align: 'center',
            alpha: 1
        });
        scoreText.setStroke("red", 8);
        xText.setStroke("red", 8);
        skate = this.add.image(game.config.width / 2 - 50,40,"coin");
        skate.rotation = 5.7;
        skate.setDisplaySize(100, 100);

        // Collisions
        this.physics.add.collider(this.player, this.platformGroup, function () {
            if (!this.player.anims.isPlaying) {
                this.player.anims.play("skate");
            }
        }, null, this);
        this.physics.add.collider(this.platformGroup, this.poubelleGroup);
        this.physics.add.collider(this.platformGroup, this.barriereGroup);
        //this.physics.add.collider(this.player, this.barriereGroup, this.fall2, null, this);
        this.physics.add.collider(this.player, this.poubelleGroup, this.fall, null, this);
        this.physics.add.collider(this.player, this.incendieGroup, this.fall, null, this);
        // setting collisions between the player and the coin group
        this.physics.add.overlap(this.player, this.coinGroup, function(player, coin){
            ++gameOptions.nbrCoin;
            //coinSound.play();
            this.tweens.add({
            targets: coin,
            y: coin.y - 100,
            alpha: 0,
            duration: 800,
            ease: "Cubic.easeOut",
            callbackScope: this,
            onComplete: function(){
                    this.coinGroup.killAndHide(coin);
                    this.coinGroup.remove(coin);
                }
            });
        }, null, this);

        // touche espace
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keySpace.on('down', () => {
            if (!fall) {
                this.checkDoubleJump();
            }
        });
        
        //plein écran
        button = this.add.image(800 - 16, 16, 'fullscreen').setOrigin(-7, 0).setInteractive({useHandCursor: true});
        button.visible = true;
        button.on('pointerup', function () {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        }, this);
    }

    addPoubelle(posX, posY) {
        let poubelle;
        poubelle = this.physics.add.sprite(posX, posY, "poubelle");
        poubelle.setVelocityX((gameOptions.platformStartSpeed * -1));
       // poubelle.setVelocityY(900);
        poubelle.setScale(0.3);
        poubelle.setImmovable(true);
        this.poubelleGroup.add(poubelle);
    }

    addBarriere(barriereWidth, posX, posY) {
        let barriere;
        barriere = this.physics.add.sprite(posX, posY, "barriere").setOrigin(0, 0.5);
        barriere.setVelocityX((gameOptions.platformStartSpeed * -1));
        barriere.displayWidth = barriereWidth;
        barriere.displayHeight = 95;
        barriere.setImmovable(true);
        this.barriereGroup.add(barriere);
    }
    
    addIncendie(posX, posY) {
        let incendie;
        incendie = this.physics.add.sprite(posX, posY-20, 'incendie-0');
        incendie.setVelocityX((gameOptions.platformStartSpeed * -1));
        incendie.setSize(80,220, false).setOffset(90, 100);
        incendie.setScale(0.65);
        var frameIncendie = this.anims.generateFrameNames('incendie');
        this.anims.create({key: 'incendie', frames: frameIncendie, frameRate: 9, repeat: -1});
        incendie.anims.play('incendie');
        this.incendieGroup.add(incendie);
    }

    addPlatform(platformWidth, posX, posY) {
        this.addedPlatforms++;
        gameOptions.platformStartSpeed += 2;
        let platform;
        console.log(this.platformPool.getLength());
        if (this.platformPool.getLength()) {
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            //let newRatio = platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        } else {
            platform = this.add.tileSprite(posX, posY, platformWidth, 110, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(gameOptions.platformStartSpeed * -1);
            this.platformGroup.add(platform);
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);

        // is there a coin over the platform?
        if(this.addedPlatforms > 1){
            if(Phaser.Math.Between(1, 100) <= gameOptions.coinPercent){
                if(this.coinPool.getLength()){
                    let coin = this.coinPool.getFirst();
                    coin.x = posX;
                    coin.y = posY - 96;
                    coin.alpha = 1;
                    coin.active = true;
                    coin.visible = true;
                    this.coinPool.remove(coin);
                }
                else{
                    let coin = this.physics.add.sprite(posX, posY - 96, "coin");
                    coin.setImmovable(true);
                    coin.setVelocityX(platform.body.velocity.x);
                    this.coinGroup.add(coin);
                }
            }
        }
    }


    update() {
        // vitesse fond
        background.tilePositionX += 2;

        // score
        gameOptions.counter = (Math.floor(clock.now / 100) / 10);
        //scoreText.setText(gameOptions.counter + ' m');
        scoreText.setText(Phaser.Math.Snap.To(gameOptions.nbrCoin/26, 1));

        // mort
        if (this.player.y > game.config.height) {
            this.gameOver(gameOptions.bestScore);
        }

        // position de début
        this.player.x = gameOptions.playerStartPosition;

        // recycling platforms
        let minDistance = game.config.width;
        let rightmostPlatformHeight = 0;
        this.platformGroup.getChildren().forEach(function (platform) {
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            if (platformDistance < minDistance) {
                minDistance = platformDistance;
                rightmostPlatformHeight = platform.y;
            }
            if (platform.x < -platform.displayWidth / 2) {
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // recycling coins
        this.coinGroup.getChildren().forEach(function(coin){
            if(coin.x < - coin.displayWidth / 2){
                this.coinGroup.killAndHide(coin);
                this.coinGroup.remove(coin);
            }
        }, this);

        // adding new platforms
        if (minDistance > this.nextPlatformDistance) {
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
            this.posPoubelle(nextPlatformWidth, nextPlatformHeight);
            //this.posBarriere(nextPlatformWidth, nextPlatformHeight);
        }

        this.poubelleGroup.getChildren().forEach(function (poubelle) {
            if (poubelle.x < -66) {
                this.poubelleGroup.killAndHide(poubelle);
            }
        }, this);

        this.barriereGroup.getChildren().forEach(function (barriere) {
            if (barriere.x < -this.nextPlatformWidth / 3) {
                this.barriereGroup.killAndHide(barriere);
            }
        }, this);

    }

    jump() {
        this.player.body.velocity.y = -450;
        isJumped++;
        jumpMusic.play();
    }

    checkDoubleJump() {
        if (this.player.body.touching.down || (isJumped > 0 && isJumped < 2)) {
            if (this.player.body.touching.down) {
                isJumped = 0;
            }
            this.jump();
        }
    }

    fall(player, poubelle) {
        if (!fall) {
            console.log("salut");
            fall = true;
            poubelle.setVelocityX(-800);
            player.anims.play('fall');
            this.time.addEvent({delay: 500, callback: this.gameOver, callbackScope: this});
        }
    }

    posPoubelle(nextPlatformWidth, nextPlatformHeight) {
        var poubelle1 = Phaser.Math.Between(150, nextPlatformWidth);
        var poubelle2 = Phaser.Math.Between(150, nextPlatformWidth);
        if (poubelle1 <= poubelle2) {
            if (poubelle2 - poubelle1 < 400 && nextPlatformWidth > poubelle1 + 400) {
                poubelle2 = poubelle1 + Phaser.Math.Between(400, nextPlatformWidth - poubelle1);
            }
        } else if (poubelle2 < poubelle1) {
            if (poubelle1 - poubelle2 < 400 && nextPlatformWidth > poubelle2 + 400) {
                poubelle1 = poubelle2 + Phaser.Math.Between(400, nextPlatformWidth - poubelle2);
            }
        }
        this.addPoubelle(game.config.width + poubelle1, nextPlatformHeight - 80);
        this.addIncendie(game.config.width + poubelle2, nextPlatformHeight - 80);
    }


    gameOver() {
        gameOptions.counter = Math.floor(clock.now / 100);
        this.scene.launch("pause", gameOptions.counter / 10);
        button.setVisible(false);
        var cam = this.cameras.main;
        cam.alpha = 0.5;
        this.player.destroy();
        scoreText.visible = false;
        skate.visible = false;
        xText.visible = false;
        graphics.visible = false;
        theme.stop();
        if(gameOptions.nbrCoin > bestScore) {
            congratulation.play();
        } else {
            gameoverMusic.play();
        }
        this.scene.pause("PlayGame");
    }

}
