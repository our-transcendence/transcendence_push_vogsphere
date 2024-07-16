export default class Ball {
    constructor(color, rect, context, dir) {
        this.color = color;
        this.rect = rect;
        this.context = context;
        this.dir = {x: dir, y: 1};
        this.speed = {x: 3, y: Math.random() * (5 + 5) - 5};
        this.trail = [];
    }

    update() {
        if (this.speed.x < 0) {
            this.speed.x *= -1;
            this.dir.x *= -1;
        }
        if (this.speed.y < 0) {
            this.speed.y *= -1;
            this.dir.y *= -1;
        }
        this.rect.posX += this.dir.x * this.speed.x;
        console.log(this.rect.posY + this.dir.y * this.speed.y);
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