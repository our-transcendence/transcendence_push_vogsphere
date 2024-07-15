export default class RemotePaddle {
    constructor(color, rect, context) {
        this.color = color;
        this.rect = rect;
        this.dir = {x: 0, y: 0};
        this.speed = 5;
        this.context = context;
        this.ballDir = -1;
    }

    update(pos, ball) {
        this.rect.posY = pos;
        if (ball) {
            if (this.rect.collide(ball.rect)) {
                const diff = this.rect.getCenterCoords()["y"] - ball.rect.getCenterCoords()["y"]
                ball.speed.y = Math.abs(diff * 0.075)
                ball.speed.x += 0.5
                ball.dir.y = diff > 0 ? -1 : 1
                ball.dir.x = this.ballDir;
            }
        }
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