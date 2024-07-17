import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class PongCommands extends HTMLElement {
    constructor() {
        super();

        this.localPong = lang.controles.localPong[getCookie("lang")];
        this.remotePong = lang.controles.remotePong[getCookie("lang")];
        this.localGunfight = lang.controles.localGunfight[getCookie("lang")];
        this.remoteGunfight = lang.controles.remoteGunfight[getCookie("lang")];
        this.player = lang.controles.player[getCookie("lang")];
        this.up = lang.controles.up[getCookie("lang")];
        this.down = lang.controles.down[getCookie("lang")];
        this.left = lang.controles.left[getCookie("lang")];
        this.right = lang.controles.right[getCookie("lang")];
        this.shoot = lang.controles.shoot[getCookie("lang")];

        this.commands = [
            `
            <div id="form-title">${this.localPong}</div>
            <div class="local-commands">
                <div class="player-commands">
                    <div class="commands-title">${this.player} 1</div>
                    <div class="commands-list">
                        <div class="command">
                            ${this.up}: <kbd>w</kbd>
                        </div>
                        <div class="command">
                            ${this.down}: <kbd>s</kbd>
                        </div>
                    </div>
                </div>
                <div class="player-commands">
                    <div class="commands-title">${this.player} 2</div>
                    <div class="commands-list">
                        <div class="command">
                            ${this.up}: <kbd>↑</kbd>
                        </div>
                        <div class="command">
                            ${this.down}: <kbd>↓</kbd>
                        </div>
                    </div>
                </div>
            </div>`,
            `<div id="form-title">${this.remotePong}</div>
                <div class="local-commands">
                
                <div class="player-commands">
                    <div class="commands-title">${this.player}</div>
                    <div class="commands-list">
                        <div class="command">
                            ${this.up}: <kbd>w</kbd>
                        </div>
                        <div class="command">
                            ${this.down}: <kbd>s</kbd>
                        </div>
                    </div>
                </div>
            </div>`,
        ];
        this.currentCommands = 0;
    }

    rend() {
        const title = lang.controles.title[getCookie("lang")];
        this.innerHTML = `
            <link rel="stylesheet" href="/styles/commands.css" >
            <div id="title">${title}</div>
            
            <div id="command-carousel">
                <div id="go-left" class="carousel-button">
                    <svg fill="white" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z"/></svg>
                </div>
                <div id="commands-container">
                    ${this.commands[this.currentCommands]}
                </div>
                <div id="go-right" class="carousel-button">
                    <svg fill="white" width="32" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
                </div>
            </div>
        `;

        const leftButton = this.querySelector("#go-left");
        const rightButton = this.querySelector("#go-right");

        leftButton.addEventListener('click', e => {
            e.preventDefault();
            this.currentCommands -= 1;
            this.currentCommands = ((this.currentCommands % this.commands.length) + this.commands.length) % this.commands.length;
            this.rend();
        });

        rightButton.addEventListener('click', e => {
            e.preventDefault();
            this.currentCommands += 1;
            this.currentCommands = ((this.currentCommands % this.commands.length) + this.commands.length) % this.commands.length;
            this.rend();
        });
    }

    connectedCallback() {
        this.currentCommands = 0;
        this.rend();
    }
}
