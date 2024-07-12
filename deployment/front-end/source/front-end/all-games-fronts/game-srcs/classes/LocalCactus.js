import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class LocalCactus {
    constructor(pos, context) {
        this.rect = new Rect(pos.x, pos.y, 8 * 1.4, 22 * 1.4);
        this.context = context;
        this.assets = new Image();
        this.assets.src = '/all-games-fronts/game-srcs/assets/gunfight.png';
    }

    draw() {
        this.context.drawImage(
            this.assets,
            110,
            336 - this.rect.height / 1.4 + 22,
            this.rect.width / 1.4,
            this.rect.height / 1.4,
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height
        );
    }

    hit(pos) {
        pos.y += 2;
        this.rect.height -= Math.abs(this.rect.posY - pos.y);
        if (this.rect.height < 0)
            this.rect.height = 0
        this.rect.posY = pos.y;
    }
}