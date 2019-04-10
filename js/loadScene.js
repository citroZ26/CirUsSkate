var background;
class loadScene extends Phaser.Scene{
    constructor(){
        super("load");
    }
    preload() {
        this.load.multiatlas('start', './assets/animations/start.json', './assets/animations');
        this.load.multiatlas('skate', './assets/animations/skate.json', './assets/animations');
        this.load.multiatlas('jump', './assets/animations/jump.json', './assets/animations');
        this.load.multiatlas('simpleJump', './assets/animations/simpleJump.json', './assets/animations');
        this.load.multiatlas('fall', './assets/animations/fall.json', './assets/animations');
        this.load.multiatlas('wait', './assets/animations/wait.json', './assets/animations');
        this.load.multiatlas('spark', './assets/animations/spark.json', './assets/animations');

        
        this.load.image('player','./assets/images/skate_frames/skate_frames-0.png');
        this.load.image('wait-0','./assets/images/spark-0.png');

        
        this.load.image("platform", "./assets/images/test.png");
        this.load.image("blueBackground", "./assets/images/blueBackground.png");
        this.load.image("greenBackground", "./assets/images/greenBackground.png");
        this.load.image("orangeBackground", "./assets/images/orangeBackground.png");
        this.load.image("originalBackground", "./assets/images/originalBackground.png");
        this.load.image("purpleBackground", "./assets/images/purpleBackground.png");
        this.load.image('fullscreen', './assets/images/fullscreen.png');
        this.load.image('buttonRestart', './assets/images/restartButton.png');
        this.load.image("poubelle", "./assets/images/poubelle.png");
        
        this.load.audio('jump', './assets/audio/jump.ogg');
        this.load.audio('gameover', './assets/audio/gameover.ogg');
        this.load.audio('theme', './assets/audio/theme.ogg');

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect((game.config.width / 2) - 200, (game.config.height/2) +10, 400 * value, 30);
            percentText.setText(parseInt(value * 100) + '%');
        });

        this.load.on('fileprogress', function (file) {
        });

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
            //console.log(this.scene);
            this.scene.scene.start('PlayGame');
        });

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.5);
        progressBox.fillRect((game.config.width/2)-210, (game.config.height/2), 420, 50);

        var loadingText = this.make.text({
            x: (game.config.width / 2),
            y: (game.config.height / 2) - 40,
            text: 'Loading...',
            style: {
                font: '40px monospace',
                fill: '#ffffff'
            }
        });
        
        loadingText.setOrigin(0.5, 0.5);
        
        var percentText = this.make.text({
            x: game.config.width / 2,
            y: (game.config.height / 2) + 25,
            text: '0%',
            style: {
                font: '30px monospace',
                fill: '#ffffff'
            }
        });
        
        percentText.setOrigin(0.5, 0.5);
        
        
        
        this.load.multiatlas('skate', './assets/animations/skate.json', './assets/animations');
    }

    create() {
        var logo = this.add.image(400, 300, 'logo');
    }
}
