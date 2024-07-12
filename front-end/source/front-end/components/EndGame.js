import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class EndGame extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        let win = await lang.end_game.win[getCookie("lang")];
        let replay = await lang.end_game.replay[getCookie("lang")];
        let home = await lang.end_game.home[getCookie("lang")];

        this.innerHTML = `
        <link rel="stylesheet" href="/styles/endGame.css">
            <div id="endGame">
                <div id="gameName"></div>
                <div id="players">
                    <div class="player-container">
                        <h1 id="winner-name">beroux</h1>
                        <h1 id="winner">${win} </h1>
                    </div>
                </div>
                <div id="score">
                    <h1 id="score-text"></h1>
                </div>
                <div id="buttons-container">
                    <link-route id="replay-link" class="submit-button">${replay}</link-route>
                    <link-route route="/home" class="submit-button">${home}</link-route>
                </div>
            </div>
        `;
    }

    display(game, score, winner, replayRoute) {
        const container = this.querySelector("#endGame");
        const gameName = this.querySelector("#gameName");
        const replayLink = this.querySelector("#replay-link");
        const winnerName = this.querySelector("#winner-name");
        const scoreText = this.querySelector("#score-text");

        gameName.innerText = game;
        replayLink.setAttribute("route", replayRoute);
        winnerName.innerText = winner;
        if (score)
            scoreText.innerText = `${Math.max(...Object.values(score))} : ${Math.min(...Object.values(score))}`;
        container.style.display = "flex";
    }
}
