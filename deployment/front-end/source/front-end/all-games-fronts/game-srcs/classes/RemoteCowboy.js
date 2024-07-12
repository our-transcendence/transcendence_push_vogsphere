import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class RemoteCowboy extends EventTarget {
    constructor(rect, context) {
        super();
        this.dir = {x: 0, y: 0};
        this.rect = rect;
        this.context = context;
        this.context.fillStyle = "yellow";
        this.assets = new Image();
        this.heartAsset = new Image();
        this.assets.src = '/all-games-fronts/game-srcs/assets/gunfight.png';
        this.heartAsset.src = '/all-games-fronts/game-srcs/assets/heart.png';
        this.lifePoints = 2.9;
        this.animationsSteps = [{x: 89, y: 143}, {x: 117, y: 143}, {x: 145, y: 143}];
        this.deathAnimationsSteps = [{x: 89, y: 294}];
        this.currentStep = 0;
        this.dead = false;
        this.animationInterval = setInterval(() => this.animation(), 100);
        this.bullets = 9;
    }

    animation() {
        if (this.dir.x === 0 && this.dir.y === 0) {
            this.currentStep = 0;
        } else if (this.dead) {
            this.currentStep = 0;
        }
        else {
            this.currentStep += 1;
            this.currentStep %= this.animationsSteps.length;
        }
        this.dir.x = 0;
        this.dir.y = 0;
    }

    update(pos) {
        this.dir.x = this.rect.posX - pos[0];
        this.dir.y = this.rect.posY - pos[1];
        this.rect.posX = pos[0];
        this.rect.posY = pos[1];
    }

    draw() {
        if (this.dead) {
            this.context.drawImage(
                this.assets,
                this.deathAnimationsSteps[this.currentStep].x, this.deathAnimationsSteps[this.currentStep].y,
                23, 33,
                this.rect.posX, this.rect.posY,
                23, 33
            );
        } else {
            this.context.drawImage(
                this.assets,
                this.animationsSteps[this.currentStep].x, this.animationsSteps[this.currentStep].y,
                23, 33,
                this.rect.posX, this.rect.posY,
                23, 33
            );
        }
        let drawPos = 858 - 15;
        let steps = -15;
        let i = 0;
        while (i < this.bullets) {
            this.context.drawImage(
                this.assets,
                100, 348,
                5, 10,
                drawPos + steps * i, 525 - 15,
                5, 10
            )
            i++;
        }
        i = 0;
        drawPos = 858 - 15 * 3;
        steps = 15;
        while (i < parseInt(this.lifePoints)) {
            this.context.drawImage(
                this.heartAsset,
                23, 18,
                21, 19,
                drawPos + steps * i, 15,
                21 * 0.5, 19 * 0.5
            )
            i++;
        }
        if (this.lifePoints % 1) {
            this.context.drawImage(
                this.heartAsset,
                23, 18,
                21 * (this.lifePoints % 1), 19,
                drawPos + steps * i, 15,
                21 * (this.lifePoints % 1) * 0.5, 19 * 0.5
            )
        }
    }

    hit() {
        this.currentStep = 0;
        this.dead = true;
        setTimeout(() => this.dispatchEvent(new Event("hit")), 200);
    }

    stop() {
        clearInterval(this.animationInterval);
        clearInterval(this.lifeInterval);
    }
}
