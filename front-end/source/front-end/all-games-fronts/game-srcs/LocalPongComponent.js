import LocalPong from "/all-games-fronts/game-srcs/classes/LocalPong.js";
import GameElement from "/all-games-fronts/game-srcs/classes/gameElement.js";

export default class LocalPongComponent extends GameElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.addCanvas();

        this.winner = null;
        this.scores = null;
        if (!this.attributes["player_1"] || !this.attributes["player_2"]) {
            this.dispatchEvent(new Event('name_err'));
            return;
        }
        this.player_1 = this.attributes["player_1"].value;
        this.player_2 = this.attributes["player_2"].value;
        this.context = this.canvas.getContext("2d");
        this.game = new LocalPong(this.player_1, this.player_2, this.canvas);
        this.game.onEnd = (winner, scores) => {
            this.winner = winner;
            this.scores = scores;
            this.dispatchEvent(new CustomEvent("endGame", {detail: {
                    winner: winner,
                    scores: this.scores
                }}));
        };
        this.game.run();
    }

    getWinner() {
        return this.winner;
    }

    getScores() {
        return this.scores;
    }

    disconnectedCallback() {
    }

    adoptedCallback() {
    }

    attributeChangedCallback(name, oldValue, newValue) {
    }
}
