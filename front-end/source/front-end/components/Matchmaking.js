import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class Matchmaking extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const title = lang.matchmaking.title[getCookie("lang")];
        this.innerHTML = `
            <link rel="stylesheet" href="/styles/matchmaking.css">
            <div id="matchmaking-container">
                <p id="status-text">${title}</p>
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
