export default class ChooseGame extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <link rel="stylesheet" href="/styles/chooseGame.css">
            <div class="select-container">
                <div class="game" id="gunfight"><p>gunfight</p></div>
                <div class="game" id="pong"><p>pong</p></div>
            </div>
        `;
    }
}
