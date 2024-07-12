import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class LocalTree {
    constructor(pos, context) {
        this.rect = new Rect(pos.x, pos.y, 16 * 1.4, 27 * 1.4);
        this.context = context;
        this.assets = new Image();
        this.assets.src = '/all-games-fronts/game-srcs/assets/gunfight.png';
    }

    draw() {
        this.context.drawImage(
            this.assets,
            123,
            331,
            this.rect.width / 1.4,
            this.rect.height / 1.4,
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height
        );
    }
}