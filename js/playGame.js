let gameOptions = {
    platformStartSpeed: 350,
    spawnRange: [350, 650],
    platformSizeRange: [1000, 1000],
    playerGravity: 900,
    jumpForce: 500,
    playerStartPosition: 200,
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
var theme;


class playGame extends Phaser.Scene {
    
    
    constructor(){
        super("PlayGame");
    }
    
    create(){
        gameOptions.counter = 0; // Score à 0
        gameOptions.platformStartSpeed = 350;
        
        //audio
        jumpMusic = this.sound.add('jump');
        gameoverMusic = this.sound.add('gameover');
        theme = this.sound.add('theme');
        gameoverMusic.stop();
        theme.play();
        
        //temps
        clock = this.plugins.get('rexClock').add(this, {});
        clock.start();
        
        //background
        var tabBackground = ['blueBackground', 'greenBackground','orangeBackground','originalBackground','purpleBackground'];
        var aleaBackground = Math.round(Math.random() * Math.floor(tabBackground.length -1));
        background = this.add.tileSprite(0,0,0,0,tabBackground[aleaBackground]).setOrigin(0,0);

        // groupe platforms
        this.platformGroup = this.add.group({
            removeCallback: function(platform){
                platform.scene.platformPool.add(platform)
            }
        });

        // pool
        this.platformPool = this.add.group({
            removeCallback: function(platform){
                platform.scene.platformGroup.add(platform)
            }
        });
        
        // groupe poubelles
        this.poubelleGroup = this.add.group({
            
        });

        // ajouter une platform
        this.addPlatform(game.config.width, game.config.width / 2);

        // Ajout du joueur
        this.player = this.physics.add.sprite(gameOptions.playerStartPosition, game.config.height / 2, 'player');
        this.player.setGravityY(gameOptions.playerGravity);
        this.player.setDepth(2);
        this.player.setSize(70,240, false).setOffset(60,0);
        
        //animations
        var frameStart = this.anims.generateFrameNames('start');
        this.anims.create({ key: 'start', frames: frameStart, frameRate: 22, repeat:0 });
        this.player.anims.play('start');
        
        var frameSimpleJump = this.anims.generateFrameNames('simpleJump');
        this.anims.create({ key: 'simpleJump', frames: frameSimpleJump, frameRate: 16 });
        
        var frameJump = this.anims.generateFrameNames('jump');
        this.anims.create({ key: 'jump', frames: frameJump, frameRate: 11 });
        
        var frameFall = this.anims.generateFrameNames('fall');
        this.anims.create({ key: 'fall', frames: frameFall, frameRate: 18 });
        
        //score en jeux
        scoreText = this.add.text(100, 100, '0 m', { font: '75px', fill: 'white', color: 'white', align: 'left', alpha: 1 });
        
        // Collisions
        this.physics.add.collider(this.player, this.platformGroup);
        this.physics.add.collider(this.platformGroup, this.poubelleGroup);

        // touche espace
        keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        keySpace.on('down', () => {
            if(!fall) {
                this.checkDoubleJump();
            }
        });

        //plein écran
        button = this.add.image(800-16, 16, 'fullscreen').setOrigin(-7,0).setInteractive();
        button.visible = true;
        button.on('pointerup', function () {
            if (this.scale.isFullscreen){
                this.scale.stopFullscreen();
            } 
            else {
                this.scale.startFullscreen();
            }
        }, this);
        button.input.cursor = 'pointer';
        
        isJumped = 0;
    }
    
    addPoubelle(posX) {
        this.poubelle = this.physics.add.sprite(posX, game.config.height * 0.7, "poubelle");
        this.poubelle.setVelocityX(gameOptions.platformStartSpeed * -1);
        this.poubelle.setVelocityY(900);
        this.poubelle.setScale(.3);
        this.poubelleGroup.add(this.poubelle);
    }
    
    
    addPlatform(platformWidth, posX){
        let platform;
        /*if(this.platformPool.getLength()){
            platform = this.platformPool.getFirst();
            platform.x = posX;
            platform.active = true;
            platform.visible = true;
            this.platformPool.remove(platform);
        }
        else{*/
            platform = this.physics.add.sprite(posX, game.config.height * 0.89, "platform");
            platform.setImmovable(true);
            platform.setVelocityX(gameOptions.platformStartSpeed * -1);
            gameOptions.platformStartSpeed += 10;
            this.platformGroup.add(platform);
        
        platform.displayWidth = platformWidth;
        this.nextPlatformDistance = Phaser.Math.Between(gameOptions.spawnRange[0], gameOptions.spawnRange[1]);
    }
    
    
    update(){
        // vitesse fond
        background.tilePositionX += 1;
        
        // score
        gameOptions.counter = Math.floor(clock.now/100) / 10;
        scoreText.setText(gameOptions.counter + ' m');
        
        // collision
        this.physics.add.collider(this.player, this.poubelleGroup, this.fall,null,this);
        
        // mort
        if(this.player.y > game.config.height){
            this.gameOver(gameOptions.bestScore);
        }
        
        // position de début
        this.player.x = gameOptions.playerStartPosition;

        // recycling platforms
        let minDistance = game.config.width;
        this.platformGroup.getChildren().forEach(function(platform){
            let platformDistance = game.config.width - platform.x - platform.displayWidth / 2;
            minDistance = Math.min(minDistance, platformDistance);
            if(platform.x <- platform.displayWidth / 2){
                this.platformGroup.killAndHide(platform);
                this.platformGroup.remove(platform);
            }
        }, this);

        // adding new platforms
        if(minDistance > this.nextPlatformDistance){
            var nextPlatformWidth = Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1]);
            this.addPlatform(nextPlatformWidth, game.config.width + nextPlatformWidth / 2);
            this.addPoubelle(game.config.width + Phaser.Math.Between(gameOptions.platformSizeRange[0], gameOptions.platformSizeRange[1])/2);
        }
                
    }
    
    jump() {
      this.player.body.velocity.y = -450;
        jumpMusic.play();
        isJumped ++;
    }
    
    checkDoubleJump() {
      if (this.player.body.touching.down || (isJumped > 0 && isJumped < 2)) {
          if(this.player.body.touching.down) {
              isJumped = 0;
          }
          this.jump();
      }
    }
    
    
    fall(player, poubelle) {
        if(fall) {
            fall = false;
            poubelle.setVelocityX(-800);
            player.anims.play('fall'); 
        }
        this.time.addEvent({ delay: 500, callback: this.gameOver, callbackScope: this});
    }
    
    gameOver(bestScore) {
        gameOptions.counter = Math.floor(clock.now/100);
        this.scene.launch("pause", gameOptions.counter/10);
        button.setVisible(false);
        var cam = this.cameras.main;
        cam.alpha = 0.5;
        this.player.destroy();
        theme.stop();
        gameoverMusic.play();
        this.scene.pause("PlayGame");
    }
    
}