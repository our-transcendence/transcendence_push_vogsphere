export default class Ball {
    constructor(color, rect, context) {
        this.color = color;
        this.rect = rect;
        this.context = context;
        this.dir = {x: -1, y: 1};
        this.speed = {x: 3, y: 3};
    }

    update() {
        this.rect.posX += this.dir.x * this.speed.x;
        if (this.rect.posY + this.dir.y * this.speed.y < 0) {
            this.dir.y = 1;
        }
        else if (this.rect.posY + this.dir.y * this.speed.y > this.context.canvas.height - this.rect.height) {
            this.dir.y = -1;
        }
        this.rect.posY += this.dir.y * this.speed.y;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height
        );
        this.context.save();
    }
}