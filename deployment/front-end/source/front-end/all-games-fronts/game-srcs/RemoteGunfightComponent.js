import GameElement from "./classes/gameElement.js";
import RemoteGunfight from "./classes/RemoteGunFight";

export default class RemoteGunfightComponent extends GameElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addCanvas();
        if (this.attributes.getNamedItem("gameAddr") === null) {
            throw new Error("No gameAddr given to remote pong element");
        }
        console.info("Remote gunfight component connected");
        const gameAddr = this.attributes.getNamedItem("gameAddr").value;
        this.winner = null;
        this.scores = null;
        this.context = this.canvas.getContext("2d");
        this.game = new RemoteGunfight(this.canvas, gameAddr);
        this.game.onEnd = (winner) => {
            this.winner = winner;
            this.dispatchEvent(new CustomEvent("endGame", {bubbles: true, detail: {winner: winner}}));
        };
        this.game.run();
        this.game.addEventListener("authError", (event) => this.dispatchEvent(new Event("authError", {bubbles: true})));
    }

    disconnectedCallback() {
    }

    adoptedCallback() {
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }
}