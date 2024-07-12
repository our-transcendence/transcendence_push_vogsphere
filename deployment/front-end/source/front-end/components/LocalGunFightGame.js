export default class LocalGunFightGame extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const params = new URLSearchParams(window.location.search);

        if (!params.has("player1")) {
            return ;
            return;
        }
        if (!params.has("player2")) {
            return ;
            return;
        }

        this.innerHTML = `
        <local-gunfight player_1="${params.get('player1')}" player_2="${params.get('player2')}"></local-gunfight>
        <end-game-modal></end-game-modal>
        `

        const game = this.querySelector("local-gunfight");
        const endModal = this.querySelector("end-game-modal");
        game.addEventListener("endGame", (e) => {
            endModal.display("local gunfight", null, e.detail.winner, "/gunfight/local/form");
        });
    }
}
