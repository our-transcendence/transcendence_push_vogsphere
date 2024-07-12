export default class LocalPaddle {
    constructor(color, rect, ballDir, inputsMap, context) {
        this.color = color;
        this.rect = rect;
        this.ballDir = ballDir;
        this.dir = {x: 0, y: 0};
        this.speed = 5;
        this.inputsMap = inputsMap;
        this.context = context;
    }

    update(ball) {
        if (this.rect.posX + this.dir.x * this.speed < 0)
            this.rect.posX = 0;
        else if (this.rect.posX + this.dir.x * this.speed > this.context.canvas.width - this.rect.width)
            this.rect.posX = this.context.canvas.width - this.rect.width;
        else
            this.rect.posX += this.dir.x * this.speed;
        if (this.rect.posY + this.dir.y * this.speed < 0)
            this.rect.posY = 0;
        else if (this.rect.posY + this.dir.y * this.speed > this.context.canvas.height - this.rect.height)
            this.rect.posY = this.context.canvas.height - this.rect.height;
        else
            this.rect.posY += this.dir.y * this.speed;
        if (ball !== undefined) {
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

    input(event) {
        if (event.type === "blur")
            this.dir.y = 0;
        if (event.type === "keydown") {
            if (event.keyCode === this.inputsMap.up)
                this.dir.y -= 1;
            if (event.keyCode === this.inputsMap.down)
                this.dir.y += 1;
        }
        if (event.type === "keyup") {
            if (event.keyCode === this.inputsMap.up)
                this.dir.y += 1;
            if (event.keyCode === this.inputsMap.down)
                this.dir.y -= 1;
        }
        if (this.dir.y > 1)
            this.dir.y = 1;
        if (this.dir.y < -1)
            this.dir.y = -1;
    }
}