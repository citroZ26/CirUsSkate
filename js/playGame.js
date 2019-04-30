let gameOptions = {
    // plage de vitesse de la plateform, en pixels par seconde
    platformSpeedRange: [300, 300],

    // spawn range, à quelle distance doit être la plate-forme la plus à droite du bord droit
    // before next platform spawns, in pixels
    spawnRange: [80, 300],

    // plage de spawn, how far should be the rightmost platform from the right edge
    // avant que la prochaine plateform apparaisse, en pixels
    platformStartSpeed: 350,

    // largeur de la plate-forme, en pixels
    platformSizeRange: [688, 688],

    // une plage haute entre la plateforme la plus à droite et la prochaine plateforme à engendrer
    platformHeightRange: [-5, 5],

    // a scale to be multiplied by platformHeightRange
    platformHeighScale: 100,

    // hauteur maximale et minimale de la plate-forme, en tant que rapport de hauteur d'écran
    platformVerticalLimit: [0.95, 0.95],

    playerStartPosition: 200,
    playerGravity: 900,
    jumpForce: 500,
    jumps: 1,
    counter: 0,
    bestScore: 37
}

var jumpMusic;
var poubelle;
var gameoverMusic;
var buttonRestart;
var aKey;
var keySpace;
var background;
var jumpSprite;
var animation;
var button;
var player;
var playerStart;
var clock;
var spark;
var fall = false;
var timerFall;
var scoreText;
var timedEvent;
var isJumped = 0;


class playGame extends Phaser.Scene {


    constructor() {
        super("PlayGame");
    }

    create() {
        gameOptions.counter = 0; // Score à 0
        gameOptions.platformStartSpeed = 200;
        fall = false;

        // keeping track of added platforms
        this.addedPlatforms = 0;

        //audio
        jumpMusic = this.sound.add('jump');
        gameoverMusic = this.sound.add('jump');
        var theme = this.sound.add('theme');
        theme.play();

        //temps
        clock = this.plugins.get('rexClock').add(this, {});
        clock.start();

        //background
        /*var tabBackground = ['blueBackground', 'greenBackground','orangeBackground','originalBackground','purpleBackground'];
        var aleaBackground = Math.round(Math.random() * Math.floor(tabBackground.length -1));
        background = this.add.tileSprite(0,0,0,0,tabBackground[aleaBackground]).setOrigin(0,0);*/

        //background = this.add.tileSprite(0,0,0,0,'blueBackground').setOrigin(0,0);

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

        //score en jeux
        scoreText = this.add.text(100, 100, '0 m', {
            font: '75px',
            fill: 'white',
            color: 'white',
            align: 'left',
            alpha: 1
        });

        // Collisions
        this.physics.add.collider(this.player, this.platformGroup, function () {
            if (!this.player.anims.isPlaying) {
                this.player.anims.play("skate");
            }
        }, null, this);
        this.physics.add.collider(this.platformGroup, this.poubelleGroup);
        this.physics.add.collider(this.platformGroup, this.barriereGroup);
        this.physics.add.collider(this.player, this.barriereGroup, this.fall, null, this);
        this.physics.add.collider(this.player, this.poubelleGroup, this.fall, null, this);

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

    addPoubelle(posX) {
        let poubelle;
        poubelle = this.physics.add.sprite(posX, game.config.height * 0.7, "poubelle");
        poubelle.setVelocityX((gameOptions.platformStartSpeed * -1));
        poubelle.setVelocityY(900);
        poubelle.setScale(.3);
        this.poubelleGroup.add(poubelle);
    }

    addBarriere(barriereWidth, posX) {
        let barriere;
        barriere = this.physics.add.sprite(posX, game.config.height * 0.767, "barriere").setOrigin(0, 0.5);
        barriere.setVelocityX((gameOptions.platformStartSpeed * -1));
        barriere.displayWidth = barriereWidth;
        barriere.displayHeight = 95;
        barriere.setImmovable(true);
        this.barriereGroup.add(barriere);
    }

    addPlatform(platformWidth, posX, posY) {
        this.addedPlatforms++;
        let platform;
        if (this.platformPool.getLength()) {
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.y = posY;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
            let newRatio = platformWidth / platform.displayWidth;
            platform.displayWidth = platformWidth;
            platform.tileScaleX = 1 / platform.scaleX;
        } else {
            platform = this.add.tileSprite(posX, posY, platformWidth, 110, "platform");
            this.physics.add.existing(platform);
            platform.body.setImmovable(true);
            platform.body.setVelocityX(Phaser.Math.Between(gameOptions.platformSpeedRange[0], gameOptions.platformSpeedRange[1]) * -1);
            this.platformGroup.add(platform);
        }
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }


    update() {
        // vitesse fond
        //background.tilePositionX += 1;

        // score
        gameOptions.counter = (Math.floor(clock.now / 100) / 10);
        scoreText.setText(gameOptions.counter + ' m');

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

        // adding new platforms
        if (minDistance > this.nextPlatformDistance) {
            let nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            let platformRandomHeight = gameOptions.platformHeighScale * Phaser.Math.Between(gameOptions.platformHeightRange[0], gameOptions.platformHeightRange[1]);
            let nextPlatformGap = rightmostPlatformHeight + platformRandomHeight;
            let minPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[0];
            let maxPlatformHeight = game.config.height * gameOptions.platformVerticalLimit[1];
            let nextPlatformHeight = Phaser.Math.Clamp(nextPlatformGap, minPlatformHeight, maxPlatformHeight);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2, nextPlatformHeight);
        }

        this.poubelleGroup.getChildren().forEach(function (poubelle) {
            if (poubelle.x < -66) {
                this.poubelleGroup.killAndHide(poubelle);
            }
        }, this);

        this.barriereGroup.getChildren().forEach(function (barriere) {
            if (barriere.x < -nextPlatformWidth / 3) {
                this.barriereGroup.killAndHide(barriere);
            }
        }, this);

    }

    jump() {
        this.player.body.velocity.y = -450;
        isJumped++;
    }

    checkDoubleJump() {
        if (this.player.body.touching.down || (isJumped > 0 && isJumped < 2)) {
            if (this.player.body.touching.down) {
                isJumped = 0;
            }
            this.jump();
        }
    }

    posBarriere(nextPlatformWidth) {
        //if (nextPlatformWidth > 2000) {
        var barriere1 = 200;
        var barriereWidth = Phaser.Math.Between(nextPlatformWidth / 4, nextPlatformWidth / 3);
        this.addBarriere(barriereWidth, game.config.width + barriere1);
        // }
    }


    fall(player, poubelle) {
        if (!fall && this.player.y > 425) {
            fall = true;
            poubelle.setVelocityX(-800);
            player.anims.play('fall');
            this.time.addEvent({delay: 500, callback: this.gameOver, callbackScope: this});
        }
    }

    posPoubelle(nextPlatformWidth) {
        var poubelle1 = Phaser.Math.Between(150, nextPlatformWidth - 500);
        var poubelle2 = Phaser.Math.Between(150, nextPlatformWidth);
        console.log(poubelle1, poubelle2);
        if (poubelle1 <= poubelle2) {
            if (poubelle2 - poubelle1 < 400 && nextPlatformWidth > poubelle1 + 400) {
                poubelle2 = poubelle1 + Phaser.Math.Between(400, nextPlatformWidth - poubelle1);
            }
        } else if (poubelle2 < poubelle1) {
            if (poubelle1 - poubelle2 < 400 && nextPlatformWidth > poubelle2 + 400) {
                poubelle1 = poubelle2 + Phaser.Math.Between(400, nextPlatformWidth - poubelle2);
            }
        }
        console.log(poubelle1, poubelle2);
        this.addPoubelle(game.config.width + poubelle1);
        this.addPoubelle(game.config.width + poubelle2);
    }


    gameOver() {
        gameOptions.counter = Math.floor(clock.now / 100);
        this.scene.launch("pause", gameOptions.counter / 10);
        button.setVisible(false);
        var cam = this.cameras.main;
        cam.alpha = 0.5;
        this.player.destroy();
        scoreText.visible = false;
        this.scene.pause("PlayGame");
    }

}
