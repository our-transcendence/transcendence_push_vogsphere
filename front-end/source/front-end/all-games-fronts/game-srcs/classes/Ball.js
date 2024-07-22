export default class Ball {
    constructor(color, rect, context, dir) {
        this.color = color;
        this.rect = rect;
        this.context = context;
        this.dir = {x: dir, y: 1};
        this.speed = {x: 3, y: Math.random() * 10 - 5};
        this.trail = [];
    }

    update() {
        if (this.rect.posX <= 858 - 10 - 20 && this.rect.posX >= 20)
            this.trail.push({...this.rect});
        if (this.trail.length > 10)
            this.trail.shift();
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
    }

    draw() {
        this.context.fillStyle = this.color;
        for (let i = 0; i < this.trail.length; i++) {
            this.trail[i].width -= 0.5;
            this.trail[i].height -= 0.5;
            this.context.fillRect(
                this.trail[i].posX,
                this.trail[i].posY,
                this.trail[i].width,
                this.trail[i].height
            );
        }
        this.context.fillRect(
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height
        );
        this.context.save();
    }
}