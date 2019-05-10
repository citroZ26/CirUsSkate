var fall = false;
var isJumped = 0;
var nb = 0;
var velocity; 
var nbrNiveau;

class Niveau extends Phaser.Scene {
    constructor() {
        super("Niveau");
        this.obstaclesTiles = [];
    }
    init(data) {
           nbrNiveau=data; 
    }

    create() {
        fall = false;
        velocity = 300;
        nb++;
        
         //audio
        jumpMusic = this.sound.add('jump');
        gameoverMusic = this.sound.add('gameover');
        theme = this.sound.add('theme');
        coinSound = this.sound.add('coin');
        congratulation = this.sound.add('congratulation');
        theme.play();
        
        //background
        var background = this.add.tileSprite(0,0,0,0,'blueBackground').setOrigin(0,0);
        if (nbrNiveau == 1) {
            this.map = this.make.tilemap({key: "n1", tileWidth: 16, tileHeight: 16});
        }
        else if (nbrNiveau == 2) {
            this.map = this.make.tilemap({key: "n2", tileWidth: 16, tileHeight: 16});
        }
        else if (nbrNiveau == 3) {
            this.map = this.make.tilemap({key: "n3", tileWidth: 16, tileHeight: 16});
        }
        else if (nbrNiveau == 4) {
            this.map = this.make.tilemap({key: "n4", tileWidth: 16, tileHeight: 16});
        }
        this.map.addTilesetImage("collide");
        this.map.addTilesetImage("platform");
        this.obstaclesTiles.push(this.map.addTilesetImage("incendie"));
        this.obstaclesTiles.push(this.map.addTilesetImage("egout"));
        this.obstaclesTiles.push(this.map.addTilesetImage("grue"));
        this.obstaclesTiles.push(this.map.addTilesetImage("poubelle"));
        var collider = this.map.createStaticLayer("Collide", "collide", 0, 0);
        var map = this.map.createStaticLayer("map", "platform", 0, 0);
        var obstacle = this.map.createStaticLayer("obstacle", this.obstaclesTiles, 0, 0);
        collider.setTileIndexCallback(31, this.fall, this);
        collider.setTileIndexCallback(32, this.end, this);
        collider.setTileIndexCallback(29, this.stop, this);
        
        collider.setDepth(0);
        background.setDepth(1);
        map.setDepth(2);
        obstacle.setDepth(2);
        
        collider.setCollision(30);
        collider.setCollision(29);
        collider.setCollision(32);
        
        // Ajout du joueur
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, 'player');
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);
        this.player.setSize(70, 160, false).setOffset(60, 80);
        this.player.setVelocityX(velocity);
        //this.player.setCollideWorldBounds(true);
        this.cameras.main.setBounds(0, 0, 999999, game.config.height);
        this.cameras.main.startFollow(this.player);
        
        //this.cameras.main.followOffset.set(-300, 0);
        
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
        this.anims.create({key: 'fall', frames: frameFall, frameRate: 18, repeat: 0});

        var frameSpark = this.anims.generateFrameNames('spark');
        this.anims.create({key: 'spark', frames: frameSpark, frameRate: 10, repeat: -1});
        
        var frameWait = this.anims.generateFrameNames('wait');
        this.anims.create({ key: 'wait', frames: frameWait, frameRate: 22, repeat:-1 });
        
        var frameRed = this.anims.generateFrameNames('redshot');
        this.anims.create({key: 'redshot', frames: 'redfire',frameRate: 8,repeat: -1});
        
        var frameViolet = this.anims.generateFrameNames('violetshot');
        this.anims.create({key: 'violetshot', frames: 'violetfire',frameRate: 8,repeat: -1});
        
        var frameYellow = this.anims.generateFrameNames('yellowshot');
        this.anims.create({key: 'yellowshot', frames: 'yellowfire',frameRate: 8,repeat: -1});
        
        var frameBlue = this.anims.generateFrameNames('blueshot');
        this.anims.create({key: 'blueshot', frames: 'bluefire',frameRate: 8,repeat: 10});
        
        this.physics.add.collider(this.player, collider, function () {
            if (!this.player.anims.isPlaying) {
                this.player.anims.play("skate");
            }
            isJumped = 0;
        }, null, this);
        //this.physics.add.overlap(this.player, collider, this.fall, null, this);
        
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


    update() {
        // mort
        if (this.player.y > game.config.height) {
            this.gameOverLoose();
            this.player.destroy();
            theme.stop();
            gameoverMusic.play();

        }  
    }
    
    fall(player, collider) {
        if (!fall) {
            fall = true;
            player.anims.play('fall');
            this.time.addEvent({delay: 500, callback: this.gameOverLoose, callbackScope: this});
        }
    }
    jump() {
        this.player.body.velocity.y = -450;
        isJumped++;
        jumpMusic.play();
    }
    checkDoubleJump() {
        if ((isJumped == 0 || (isJumped > 0 && isJumped < 2*nb)) && (this.player.body.velocity.x > 50)) {
            this.jump();
        }
    }
    end(player, collider) {
        this.player.setVelocityX(0);
        this.player.anims.play('wait');
        this.blue = this.add.sprite(this.player.x - 300, 400,'bluefire-0');
        this.blue.setScale(5);
        this.blue.anims.play('blueshot');
        this.red = this.add.sprite(this.player.x, 200,'redfire-0');
        this.red.setScale(5);
        this.red.anims.play('redshot');
        this.yellow = this.add.sprite(this.player.x + 400, 300,'yellowfire-0');
        this.yellow.setScale(5);
        this.yellow.anims.play('yellowshot');
        this.time.addEvent({delay: 1500, callback: this.gameOverEnd, callbackScope: this});
    }
    stop(player, collider) {
        fall = true;
    }
    
    gameOverEnd() {
        this.scene.launch("niveauPause", nbrNiveau);
        var cam = this.cameras.main;
        this.player.destroy();
        this.scene.pause("Niveau");
    }
    gameOverLoose() {
        this.scene.launch("niveauPause", 10);
        var cam = this.cameras.main;
        this.player.destroy();
        this.scene.pause("Niveau");
    }

}
