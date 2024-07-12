export default class GameElement extends HTMLElement {
    addCanvas() {
        this.canvas = document.createElement("canvas");
        this.style.display = "flex";
        this.style.flexDirection = "row";
        this.style.justifyContent = "center";
        this.canvas.width = 858;
        this.canvas.height = 525;
        this.canvas.style.position = "absolute";
        this.canvas.style.imageRendering = "pixelated";
        this.canvas.style.backgroundColor = "black";
        this.appendChild(this.canvas);
        this.resizeCanvas();

        window.addEventListener("resize", () => this.resizeCanvas());
    }

    resizeCanvas() {
        const windowRatio = window.innerWidth/window.innerHeight
        if ((windowRatio / 1.63428571429) < 1) {
            this.canvas.style.width = "100%";
            this.canvas.style.height = (this.canvas.clientWidth / 1.63428571429) + "px";
        } else {
            this.canvas.style.width = "auto";
            this.canvas.style.height = "100%";
        }
    }
}