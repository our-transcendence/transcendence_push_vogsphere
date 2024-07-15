export default class Ball {
    constructor(color, rect, context) {
        this.color = color;
        this.rect = rect;
        this.context = context;
        this.dir = {x: -1, y: 1};
        this.speed = {x: 3, y: 3};
        this.trail = [];
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
        this.trail.push(this.rect);
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height
        );
        for (var i = 0; i < this.trail.length; i++) {
            this.context.fillRect(
                this.trail[i].posX,
                this.trail[i].posY,
                this.trail[i].width,
                this.trail[i].height
            );
        }

        this.context.save();
    }
}