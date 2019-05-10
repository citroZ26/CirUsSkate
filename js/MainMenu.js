let infini;

class MainMenu extends Phaser.Scene {
    constructor() {
        super({key: "MainMenu"});
    }

    create() {
        var title = this.add.image(0,0,"eskate").setScale(0.4);
        /*var title = this.add.text(game.config.width/2 - 270, game.config.height/2 - 180, 'E-SKATE GAME', {
            font: '80px',
            fill: 'yellow',
            color: 'yellow',
            align: 'center',
            alpha: 1
        });
        title.setStroke("red", 8);*/
        Phaser.Display.Align.In.Center(title, this.add.zone(game.config.width/2, game.config.height/2 - 100, game.config.width, game.config.height));

        var infini = this.add.text(game.config.width/2 - 170, game.config.height/2, 'Click here to begin...', {
            font: '30px',
            fill: 'black',
            color: 'black',
            align: 'center',
            alpha: 1
        });
        infini.setStroke('black', 2);
        Phaser.Display.Align.In.Center(infini, this.add.zone(game.config.width/2, game.config.height/2, game.config.width, game.config.height));

        infini.setInteractive({
            useHandCursor: true
        });
        title.setInteractive({
            useHandCursor: true
        });

        this.fireGroup = this.add.group({});
        var fire = this.physics.add.sprite(200,200, 'fire');
        Phaser.Display.Align.In.LeftCenter(fire, this.add.zone(game.config.width/2, game.config.height/2 - 100, game.config.width, game.config.height));
        var frameFire = this.anims.generateFrameNames('fire');
        this.anims.create({key: 'fire', frames: frameFire, frameRate: 10, repeat: -1});
        fire.anims.play('fire');
        this.fireGroup.add(fire);

        var fire2 = this.physics.add.sprite(200,200, 'fire');
        Phaser.Display.Align.In.RightCenter(fire2, this.add.zone(game.config.width/2, game.config.height/2 - 100, game.config.width, game.config.height));
        fire2.anims.play('fire');
        this.fireGroup.add(fire2);

        infini.on("pointerdown", function() {
            this.scene.scene.start('Niveau' , 2);
        });

        title.on("pointerdown", function() {
            this.scene.scene.start('Niveau' , 2);
        });


    }
};
