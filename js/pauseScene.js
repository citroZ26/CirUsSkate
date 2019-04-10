var button;
var score = 0;
var bestScore = 2;
class pauseScene extends Phaser.Scene{
    constructor(){
        super("pause");
    }
    init(data) {
        if(data>0) {
           score=data; 
        }
    }

    create() {
        var rect = new Phaser.Geom.Rectangle(100, 100, 1134, 550);
        var graphics = this.add.graphics({ fillStyle: { color: 0x666666, alpha: 0.8 } });
        if(score > bestScore) {
            bestScore = score;
        }
        this.add.text(150, 400, 'Your score : ' + score + ' m', { font: '75px', fill: 'white', color: 'black', align: 'left', alpha: 1 });
        if(score > 28) {bestScore = score;}
        this.add.text(150, 200, 'Best score : ' + bestScore + ' m' , { font: '75px', fill: 'white', color: 'black', align: 'left' });
        
        button = this.add.image(667,575,'buttonRestart').setInteractive();
        button.visible = true;
        button.on('pointerup', function () {
            this.scene.stop("PlayGame");
            this.scene.start("PlayGame");
            this.scene.stop("pause");
        }, this);
        button.input.cursor = 'pointer';
        
        var button2 = this.add.image(800-16, 16, 'fullscreen').setOrigin(-7,0).setInteractive();
        button2.on('pointerup', function () {
            if (this.scale.isFullscreen){
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        }, this);
        button2.input.cursor = 'pointer';

        graphics.fillRectShape(rect);
        
        this.player = this.add.sprite(1200, 275,'wait-0');
        this.player.setScale(1.7);
        var frameWait = this.anims.generateFrameNames('wait');
        this.anims.create({ key: 'wait', frames: frameWait, frameRate: 22, repeat:-1 });
        this.player.anims.play('wait');
    }
    update() {
        button.rotation += 0.02;

}
}
