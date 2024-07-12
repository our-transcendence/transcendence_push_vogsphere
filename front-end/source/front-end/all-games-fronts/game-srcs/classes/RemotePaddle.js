export default class RemotePaddle {
    constructor(color, rect, context) {
        this.color = color;
        this.rect = rect;
        this.dir = {x: 0, y: 0};
        this.speed = 5;
        this.context = context;
    }

    update(pos) {
        this.rect.posY = pos;
    }

    draw() {
        this.context.fillStyle = this.color;
        this.context.fillRect(
            this.rect.posX,
            this.rect.posY,
            this.rect.width,
            this.rect.height);
        this.context.save();
    }
}