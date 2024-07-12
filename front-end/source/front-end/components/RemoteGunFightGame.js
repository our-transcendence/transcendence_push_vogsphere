import changeRoute from "../utils/changeRoute";

export default class RemoteGunFightGame extends HTMLElement {
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
        <remote-gunfight gameAddr="wss://${window.location.hostname}:${params.get('gamePort')}"></remote-gunfight>
        <end-game-modal></end-game-modal>
        `;

        const game = this.querySelector("remote-gunfight");
        const endModal = this.querySelector("end-game-modal");
        game.addEventListener("endGame", (e) => {
            endModal.display("remote gunfight", null, e.detail.winner, "/gunfight/remote/matchmaking");
        });
        game.addEventListener("authError", (e) => {
            changeRoute("/home");
        });
    }
}
