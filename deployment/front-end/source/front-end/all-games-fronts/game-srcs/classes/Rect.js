export default class Rect {
    constructor(posX, posY, width, height) {
        this.posX = posX;
        this.posY = posY;
        this.width = width;
        this.height = height;
    }

    static center(screenWidth, screenHeight, width, height) {
        const screenCenter = {x: screenWidth / 2, y: screenHeight / 2};

        return new Rect(screenCenter.x - width / 2, screenCenter.y - height / 2, width, height);
    }

    collide(other) {
        return (this.posX + this.width >= other.posX &&
            this.posX <= other.posX + other.width &&
            this.posY + this.height >= other.posY &&
            this.posY <= other.posY + other.height)
    }

    getCenterCoords() {
        return {
            x: this.posX + this.width / 2,
            y: this.posY + this.height / 2
        }
    }
}