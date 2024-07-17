import changeRoute from "../utils/changeRoute";

export default class RemotePongGame extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);

        if (!params.has("gamePort")) {
            changeRoute("/home");
            return;
        }

        this.innerHTML = `
        <remote-pong gameAddr="wss://${window.location.hostname}:${params.get('gamePort')}"></remote-pong>
        <end-game-modal></end-game-modal>
        `;

        const game = this.querySelector("remote-pong");
        const endModal = this.querySelector("end-game-modal");
        game.addEventListener("endGame", (e) => {
            if (e.detail.winner === null) {
                endModal.display("remote pong", e.detail.scores, "other", "/pong/remote/matchmaking");
            } else {
                endModal.display("remote pong", e.detail.scores, e.detail.winner.display_name, "/pong/remote/matchmaking");
            }
        });
        game.addEventListener("authError", (e) => {
            changeRoute("/home");
        });
    }
}
