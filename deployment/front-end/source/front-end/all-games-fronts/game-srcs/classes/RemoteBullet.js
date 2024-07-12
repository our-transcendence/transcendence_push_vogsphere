import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class RemoteBullet {
    constructor(pos, dir, uid, context) {
        this.dir = dir;
        this.rect = new Rect(pos.x, pos.y, 2, 2);
        this.context = context;
        this.uid = uid;
    }

    draw() {
        this.context.fillRect(this.rect.posX, this.rect.posY, this.rect.width, this.rect.height);
    }

    update() {
        this.rect.posX += 17 * this.dir;
        return (this.rect.posX <= 858 && this.rect.posX > 0);
    }
}