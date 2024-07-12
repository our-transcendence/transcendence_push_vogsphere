import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class LocalBullet {
    constructor(pos, dir, context) {
        this.dir = dir;
        this.rect = new Rect(pos.x, pos.y, 2, 2);
        this.context = context;
    }

    draw() {
        this.context.fillRect(this.rect.posX, this.rect.posY, this.rect.width, this.rect.height);
    }

    update(cacti, trees, trailer, cowboys) {
        for (let idx in cacti) {
            if (cacti[idx].rect.collide(this.rect)) {
                cacti[idx].hit({x: this.rect.posX, y: this.rect.posY});
                return false;
            }
        }
        for (let idx in trees) {
            if (trees[idx].rect.collide(this.rect)) {
                return false;
            }
        }
        for (let idx in cowboys) {
            if (this.dir !== cowboys[idx].bulletDir &&
                cowboys[idx].rect.collide(this.rect)) {
                cowboys[idx].lifePoints = parseInt(cowboys[idx].lifePoints) - 0.1;
                cowboys[idx].hit();
                return false;
            }
        }
        if (trailer) {
            if (trailer.rect.collide(this.rect))
                return false;
        }
        this.rect.posX += 17 * this.dir;
        return (this.rect.posX <= 858 && this.rect.posX > 0);
    }
}