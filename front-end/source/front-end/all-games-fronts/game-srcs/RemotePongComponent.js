import RemotePong from "/all-games-fronts/game-srcs/classes/RemotePong.js";
import GameElement from "/all-games-fronts/game-srcs/classes/gameElement.js";

export default class RemotePongComponent extends GameElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addCanvas();
        if (this.attributes.getNamedItem("gameAddr") === null) {
            throw new Error("No gameAddr given to remote pong element");
        }
        const gameAddr = this.attributes.getNamedItem("gameAddr").value;
        this.winner = null;
        this.scores = null;
        this.context = this.canvas.getContext("2d");
        this.game = new RemotePong(this.canvas, gameAddr);
        this.game.onEnd = (winner, scores) => {
            this.winner = winner;
            this.scores = scores;
            this.dispatchEvent(new CustomEvent("endGame", {bubbles: true, detail: {winner: winner, scores: scores}}));
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