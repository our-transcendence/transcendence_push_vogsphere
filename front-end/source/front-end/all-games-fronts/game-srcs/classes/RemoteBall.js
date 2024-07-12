export default class RemoteBall {
    constructor(color, rect, context) {
        this.color = color;
        this.rect = rect;
        this.context = context;
        this.dir = {x: -1, y: 1};
    }

    update() {
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