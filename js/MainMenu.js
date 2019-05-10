class MainMenu extends Phaser.Scene {
    constructor() {
        super({key: "MainMenu"});
    }

    create() {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
        var title = this.add.image(0,0,"eskate").setScale(0.4);
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


        var level1 = this.add.text(game.config.width/2 - 170, game.config.height/2, 'Level 1', {
            font: '50px',
            fill: 'black',
            color: 'black',
            align: 'center',
            alpha: 1
        });
        infini.setStroke('black', 2);
        Phaser.Display.Align.In.BottomLeft(level1, this.add.zone(0,game.config.height));
        level1.on("pointerdown", function() {
            this.scene.scene.start('Niveau' , 2);
        });
        level1.setInteractive({
            useHandCursor: true
        });

        var level2 = this.add.text(game.config.width/2 - 170, game.config.height/2, 'Level 2', {
            font: '50px',
            fill: 'black',
            color: 'black',
            align: 'center',
            alpha: 1
        });
        infini.setStroke('black', 2);
        Phaser.Display.Align.In.BottomCenter(level2, this.add.zone(game.config.width/2,game.config.height));
        level2.on("pointerdown", function() {
            this.scene.scene.start('Niveau' , 3);
        });
        level2.setInteractive({
            useHandCursor: true
        });

        var level3 = this.add.text(game.config.width/2 - 170, game.config.height/2, 'Level 3', {
            font: '50px',
            fill: 'black',
            color: 'black',
            align: 'center',
            alpha: 1
        });
        infini.setStroke('black', 2);
        Phaser.Display.Align.In.BottomRight(level3, this.add.zone(game.config.width,game.config.height));
        level3.on("pointerdown", function() {
            this.scene.scene.start('Niveau' , 4);
        });
        level3.setInteractive({
            useHandCursor: true
        });
    }
};
