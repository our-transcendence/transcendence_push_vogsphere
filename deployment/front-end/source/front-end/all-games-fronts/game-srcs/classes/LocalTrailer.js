import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class LocalTrailer {
    constructor(pos, context) {
        this.rect = new Rect(pos.x, pos.y, 24 * 1.4, 28 * 1.4);
        this.context = context;
        this.assets = new Image();
        this.assets.src = '/all-games-fronts/game-srcs/assets/gunfight.png';
        this.dir = -1;
        this.speed = 1;
    }

    update() {
        if (this.rect.posY <= 0)
            this.dir = 1;
        if (this.rect.posY + this.rect.height >= 525)
            this.dir = -1;
        this.rect.posY += this.dir * this.speed;
    }

    draw() {
        this.context.drawImage(
            this.assets,
            144,
            330,
            this.rect.width / 1.4,
            this.rect.height / 1.4,
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height
        );
    }
}