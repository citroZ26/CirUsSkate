class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene");
    }

    create() {
        var chars = [
            ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
            ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
            ['U', 'V', 'W', 'X', 'Y', 'Z', '.', '-', '<', '>']
        ];
        var cursor = {x: 0, y: 0};
        var name = '';

        var input = this.add.bitmapText(130, 50, 'arcade', 'ABCDEFGHIJ\n\nKLMNOPQRST\n\nUVWXYZ.-').setLetterSpacing(20);


        var rub = this.add.image(input.x + 430, input.y + 148, 'rub');
        var end = this.add.image(input.x + 482, input.y + 148, 'end');

        var block = this.add.image(input.x - 10, input.y - 2, 'block').setOrigin(0);

        var playerText = this.add.bitmapText(560, 310, 'arcade', name).setTint(0xff0000);

        this.input.keyboard.on('keyup', function (event) {

            if (event.keyCode === 37) {
                //  left
                if (cursor.x > 0) {
                    cursor.x--;
                    block.x -= 52;
                }
            } else if (event.keyCode === 39) {
                //  right
                if (cursor.x < 9) {
                    cursor.x++;
                    block.x += 52;
                }
            } else if (event.keyCode === 38) {
                //  up
                if (cursor.y > 0) {
                    cursor.y--;
                    block.y -= 64;
                }
            } else if (event.keyCode === 40) {
                //  down
                if (cursor.y < 2) {
                    cursor.y++;
                    block.y += 64;
                }
            } else if (event.keyCode === 13 || event.keyCode === 32) {
                //  Enter or Space
                if (cursor.x === 9 && cursor.y === 2 && name.length > 0) {
                    //  Submit
                } else if (cursor.x === 8 && cursor.y === 2 && name.length > 0) {
                    //  Rub
                    name = name.substr(0, name.length - 1);

                    playerText.text = name;
                } else if (name.length < 3) {
                    //  Add
                    name = name.concat(chars[cursor.y][cursor.x]);

                    playerText.text = name;
                }
                if (cursor.x === 9 && cursor.y === 2) {
                    this.scene.scene.start('PlayGame');

                }
            }
            console.log(name);
        });

    }
}