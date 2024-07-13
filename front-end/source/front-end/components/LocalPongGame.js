export default class LocalPongGame extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);

        if (!params.has("player1")) {
            return;
        }
        if (!params.has("player2")) {
            return;
        }

        this.innerHTML = `
        <local-pong player_1="${params.get('player1')}" player_2="${params.get('player2')}"></local-pong>
        <end-game-modal></end-game-modal>
        `;

        const game = this.querySelector("local-pong");
        const endModal = this.querySelector("end-game-modal");
        game.addEventListener("endGame", (e) => {
            endModal.display("local pong", e.detail.scores, e.detail.winner, "/pong/local/form");
        })
    }
}
