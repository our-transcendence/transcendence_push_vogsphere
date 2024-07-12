import GameElement from "/all-games-fronts/game-srcs/classes/gameElement.js";
import LocalGunfight from "/all-games-fronts/game-srcs/classes/LocalGunfight.js";

export default class LocalGunFightComponent extends GameElement {
    constructor() {
        super();
    }

    connectedCallback() {
        console.log("LocalGunFightComponent element added to page.");

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
        this.game = new LocalGunfight(this.player_1, this.player_2, this.canvas);
        this.game.addEventListener("end_game", (event) => {
            this.winner = event.detail.winner;
            this.looser = event.detail.looser;
            this.dispatchEvent(new CustomEvent("endGame", {
                detail: {winner: this.winner}
            }));
        })
        this.game.run();
    }

    getWinner() {
        return this.winner;
    }

    getScores() {
        return this.scores;
    }

    disconnectedCallback() {
        console.log("LocalGunFightComponent element removed from page.");
    }

    adoptedCallback() {
        console.log("LocalGunFightComponent element moved to new page.");
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue} in LocalGunFightComponent.`);
    }

}
