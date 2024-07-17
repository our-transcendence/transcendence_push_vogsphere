import changeRoute from "../utils/changeRoute";

export default class RemoteGunFightGame extends HTMLElement {
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
        <remote-gunfight gameAddr="wss://${window.location.hostname}:${params.get('gamePort')}"></remote-gunfight>
        <end-game-modal></end-game-modal>
        `;

        const game = this.querySelector("remote-gunfight");
        const endModal = this.querySelector("end-game-modal");
        game.addEventListener("endGame", (e) => {
            if (e.detail.winner === null) {
                endModal.display("remote gunfight", null, "other", "/gunfight/remote/matchmaking");
            } else {
                endModal.display("remote gunfight", null, e.detail.winner, "/gunfight/remote/matchmaking");
            }
        });
        game.addEventListener("authError", (e) => {
            changeRoute("/home");
        });
    }
}
