export default class RemotePongGame extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);

        if (!params.has("gamePort")) {
            console.error("game address provided");
            return;
        }

        this.innerHTML = `
        <remote-pong gameAddr="wss://${window.location.hostname}:${params.get('gamePort')}"></remote-pong>
        <end-game-modal></end-game-modal>
        `;

        const game = this.querySelector("remote-pong");
        const endModal = this.querySelector("end-game-modal");
        game.addEventListener("endGame", (e) => {
            endModal.display("remote pong", e.detail.scores, e.detail.winner.display_name, "/pong/remote/matchmaking");
        })
    }
}
