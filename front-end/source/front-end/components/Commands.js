export default class Commands extends HTMLElement {
    constructor() {
        super();

        this.commands = [
            `<div id="form-title">Local Pong</div>
                <div class="local-commands">
                
                <div class="player-commands">
                    <div class="commands-title">Player 1</div>
                    <div class="commands-list">
                        <div class="command">
                            up: <kbd>w</kbd>
                        </div>
                        <div class="command">
                            down: <kbd>s</kbd>
                        </div>
                    </div>
                </div>
                <div class="player-commands">
                        <div class="commands-title">Player 2</div>
                        <div class="commands-list">
                            <div class="command">
                                up: <kbd>↑</kbd>
                            </div>
                            <div class="command">
                                down: <kbd>↓</kbd>
                            </div>
                        </div>
                    </div>
            </div>`,
            `<div id="form-title">Remote Pong</div>
                <div class="local-commands">
                
                <div class="player-commands">
                    <div class="commands-title">Player</div>
                    <div class="commands-list">
                        <div class="command">
                            up: <kbd>w</kbd>
                        </div>
                        <div class="command">
                            down: <kbd>s</kbd>
                        </div>
                    </div>
                </div>
            </div>`,
            `<div id="form-title">Local Gunfight</div>
                <div class="local-commands">
                
                <div class="player-commands">
                    <div class="commands-title">Player 1</div>
                    <div class="commands-list">
                        <div class="command">
                            up: <kbd>w</kbd>
                        </div>
                        <div class="command">
                            down: <kbd>s</kbd>
                        </div>
                        <div class="command">
                            left: <kbd>a</kbd>
                        </div>
                        <div class="command">
                            right: <kbd>d</kbd>
                        </div>
                        <div class="command">
                            shoot: <kbd>space</kbd>
                        </div>
                    </div>
                </div>
                <div class="player-commands">
                        <div class="commands-title">Player 2</div>
                        <div class="commands-list">
                            <div class="command">
                                up: <kbd>↑</kbd>
                            </div>
                            <div class="command">
                                down: <kbd>↓</kbd>
                            </div>
                            <div class="command">
                                left: <kbd>←</kbd>
                            </div>
                            <div class="command">
                                right: <kbd>→</kbd>
                            </div>
                            <div class="command">
                                shoot: <kbd>enter</kbd>
                            </div>
                        </div>
                    </div>
            </div>`,
            `<div id="form-title">Remote Gunfight</div>
                <div class="local-commands">
                
                <div class="player-commands">
                    <div class="commands-title">Player</div>
                    <div class="commands-list">
                        <div class="command">
                            up: <kbd>w</kbd>
                        </div>
                        <div class="command">
                            down: <kbd>s</kbd>
                        </div>
                        <div class="command">
                            left: <kbd>a</kbd>
                        </div>
                        <div class="command">
                            right: <kbd>d</kbd>
                        </div>
                        <div class="command">
                            shoot: <kbd>space</kbd>
                        </div>
                    </div>
                </div>
            </div>`
        ];
        this.currentCommands = 0;
    }

    rend() {
        this.innerHTML = `
            <link rel="stylesheet" href="/styles/commands.css" >
            <div id="title">Commands</div>
            
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
            console.log("left clicked");
            this.currentCommands -= 1;
            this.currentCommands = Math.abs(this.currentCommands);
            this.currentCommands %= this.commands.length;
            this.rend();
        });

        rightButton.addEventListener('click', e => {
            e.preventDefault();
            console.log("right clicked");
            this.currentCommands += 1;
            this.currentCommands %= this.commands.length;
            this.rend();
        });
    }

    connectedCallback() {
        this.currentCommands = 0;
        this.rend();

    }
}
