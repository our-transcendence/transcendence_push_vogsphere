export default class RemoteBall {
    constructor(color, rect, context) {
        this.color = color;
        this.rect = rect;
        this.context = context;
        this.dir = {x: -1, y: 1};
        this.speed = {x: 1, y: 1};
        this.trail = [];
    }

    update() {
        if (this.rect.posX <= 858 - 10 - 20 && this.rect.posX >= 20)
            this.trail.push({...this.rect});
        if (Math.sign(this.dir.x) !== Math.sign(this.speed.x)) {
            this.speed.x *= -1;
        }
        if (Math.sign(this.dir.y) !== Math.sign(this.speed.y)) {
            this.speed.y *= -1;
        }
        if (this.trail.length > 10)
            this.trail.shift();
        this.rect.posX += this.dir.x;
        if (this.rect.posY + this.dir.y < 0) {
            this.dir.y = Math.abs(this.dir.y);
        }
        else if (this.rect.posY + this.dir.y > this.context.canvas.height - this.rect.height) {
            this.dir.y = -Math.abs(this.dir.y);
        }
        this.rect.posY += this.dir.y;
    }

    draw() {
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
        if (this.rect.posX <= 858 - 10 - 20) {
            this.context.fillRect(
                this.rect.posX,
                this.rect.posY,
                this.rect.width,
                this.rect.height
            );
        }
        this.context.save();
    }
}