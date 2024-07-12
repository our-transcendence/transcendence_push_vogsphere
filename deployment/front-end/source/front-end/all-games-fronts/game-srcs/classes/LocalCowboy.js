import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";

export default class LocalCowboy extends EventTarget {
    constructor(bulletDir, inputsMap, context) {
        super();
        this.bulletDir = bulletDir;
        this.dir = {x: 0, y: 0};
        this.rect = new Rect(0, 0, 23, 33);
        this.speed = 2.9;
        this.inputsMap = inputsMap;
        this.context = context;
        this.assets = new Image();
        this.heartAsset = new Image();
        this.assets.src = '/all-games-fronts/game-srcs/assets/gunfight.png';
        this.heartAsset.src = '/all-games-fronts/game-srcs/assets/heart.png';
        this.lifePoints = 2.9;
        this.animationsSteps = [{x: 5, y: 143}, {x: 33, y: 143}, {x: 61, y: 143}];
        this.deathAnimationsSteps = [{x: 60, y: 294}];
        if (this.bulletDir === -1) {
            this.animationsSteps = [{x: 89, y: 143}, {x: 117, y: 143}, {x: 145, y: 143}];
            this.deathAnimationsSteps = [{x: 89, y: 294}];
        }
        this.currentStep = 0;
        this.dead = false;
        this.animationInterval = setInterval(() => this.animation(), 100);
        this.lifeInterval = setInterval(() => {
            if (parseInt(this.lifePoints) !== parseInt(this.lifePoints - 0.1)) {
                this.hit();
            }
            this.lifePoints -= 0.1;
        }, 1000);
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
    }

    input(event) {
        if (event.type === "blur") {
            this.dir.x = 0;
            this.dir.y = 0;
            return;
        }
        if (!Object.values(this.inputsMap).includes(event.keyCode)) return;
        if (event.type === 'keyup') {
            this.dir.y += (event.keyCode === this.inputsMap.up);
            this.dir.y -= (event.keyCode === this.inputsMap.down);
            this.dir.x += (event.keyCode === this.inputsMap.left);
            this.dir.x -= (event.keyCode === this.inputsMap.right);
        }
        else if (event.type === "keydown") {
            this.dir.y -= (event.keyCode === this.inputsMap.up);
            this.dir.y += (event.keyCode === this.inputsMap.down);
            this.dir.x -= (event.keyCode === this.inputsMap.left);
            this.dir.x += (event.keyCode === this.inputsMap.right);
            if (event.keyCode === this.inputsMap.shoot) {
                if (this.bullets <= 0)
                    return;
                this.bullets--;
                this.lifePoints = parseInt(this.lifePoints) + 1 - 0.1;
                if (this.bulletDir === -1)
                    this.dispatchEvent(new CustomEvent("shoot", {detail: {x: this.rect.posX, y: this.rect.posY + 12}}));
                else
                    this.dispatchEvent(new CustomEvent("shoot", {detail: {x: this.rect.posX + 23, y: this.rect.posY + 12}}));
            }
        }
        if (this.dir.x > 1)
            this.dir.x = 1;
        if (this.dir.y > 1)
            this.dir.y = 1;
        if (this.dir.x < -1)
            this.dir.x = -1;
        if (this.dir.y < -1)
            this.dir.y = -1;
    }

    update() {
        if (this.bulletDir === 1) {
            if (this.rect.posX + this.dir.x * this.speed < 0)
                this.rect.posX = 0;
            else if (this.rect.posX + this.dir.x * this.speed > 200)
                this.rect.posX = 200;
            else
                this.rect.posX += this.dir.x * this.speed;
        } else {
            if (this.rect.posX + this.dir.x * this.speed < 858 - 200 - 23)
                this.rect.posX = 858 - 200 - 23;
            else if (this.rect.posX + this.dir.x * this.speed > 858 - 23)
                this.rect.posX = 858 - 23;
            else
                this.rect.posX += this.dir.x * this.speed;
        }
        if (this.rect.posY + this.dir.y * this.speed < 0)
            this.rect.posY = 0;
        else if (this.rect.posY + this.dir.y * this.speed > 525 - 33)
            this.rect.posY = 525 - 33;
        else
            this.rect.posY += this.dir.y * this.speed;
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
        let drawPos = 5;
        let steps = 15;
        if (this.bulletDir === -1) {
            drawPos = 858 - 15;
            steps = -15;
        }
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
        if (this.bulletDir === -1) {
            drawPos = 858 - 15 * 3;
            steps = 15;
        }
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
    }
}
