var buttonRestart;
var buttonNext;
var niveau;
class niveauPause extends Phaser.Scene{
    constructor(){
        super("niveauPause");
    }
    init(data) {
           niveau=data; 
    }

    create() {
        var rect = new Phaser.Geom.Rectangle(100, 100, 1134, 550);
        var graphics = this.add.graphics({ fillStyle: { color: 0x666666, alpha: 0.8 } });
        if (niveau < 10) {
            console.log()
            this.add.text(150, 200, 'Félicitation ', { font: '115px', fill: 'blue', color: 'black', align: 'left', alpha: 1 });
            this.add.text(150, 400, 'Niveau' + niveau + 'réussi', { font: '115px', fill: 'blue', color: 'black', align: 'left', alpha: 1 });
            buttonRestart = this.add.image(467,575,'buttonRestart').setInteractive({useHandCursor: true});
            buttonRestart.visible = true;
            buttonRestart.on('pointerup', function () {
                this.scene.stop("Niveau");
                this.scene.start("Niveau");
                this.scene.stop("pause");
            }, this);
            
            buttonNext = this.add.image(867,575,'buttonNext').setInteractive({useHandCursor: true});
            buttonNext.visible = true;
            buttonNext.setScale(0.2);
            buttonNext.on('pointerup', function () {
                this.scene.stop("Niveau");
                this.scene.start("Niveau", niveau + 1);
                this.scene.stop("pause");
            }, this);
        }
        if(niveau == 10) {
            this.add.text(150, 200, 'Game Over ', { font: '135px', fill: 'red', color: 'black', align: 'left', alpha: 1 });
            this.add.text(150, 400, 'Réessayez', { font: '115px', fill: 'red', color: 'black', align: 'left', alpha: 1 });
            buttonRestart = this.add.image(667,575,'buttonRestart').setInteractive({useHandCursor: true});
            buttonRestart.visible = true;
            buttonRestart.on('pointerup', function () {
                this.scene.stop("Niveau");
                this.scene.start("Niveau");
                this.scene.stop("pause");
            }, this);
        }
                
        var button2 = this.add.image(800-16, 16, 'fullscreen').setOrigin(-7,0).setInteractive({useHandCursor: true});
        button2.on('pointerup', function () {
            if (this.scale.isFullscreen){
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        }, this);

        graphics.fillRectShape(rect);
        this.player = this.add.sprite(1200, 275,'wait-0');
        this.player.setScale(1.7);
        var frameWait = this.anims.generateFrameNames('wait');
        this.anims.create({ key: 'wait', frames: frameWait, frameRate: 22, repeat:-1 });
        this.player.anims.play('wait');
    }
    update() {
        buttonRestart.rotation += 0.02;

}
}
