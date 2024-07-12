export default class Matchmaking extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `
            <link rel="stylesheet" href="/styles/matchmaking.css">
            <div id="matchmaking-container">
                <p id="status-text">matchmaking</p>
            </div>
        `;

        this.timeout = null;
    }

    joining() {
        const status =  this.querySelector("#status-text");

        status.innerText = "joining";
    }

    disconnectedCallback() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }
}
