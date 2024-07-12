import changeRoute from "../utils/changeRoute";
import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class LocalGunFightForm extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        let local_gunfight = await lang.local_games.local_gunfight[getCookie("lang")];
        let players_names = await lang.local_games.players_name[getCookie("lang")];
        let player = await lang.local_games.player[getCookie("lang")];
        let start = await lang.local_games.start[getCookie("lang")];

        this.innerHTML = `
            <div id="local-gunfight">
                <h1 id="title">${local_gunfight}</h1>
                <h2 id="form-title">${players_names}</h2>
                
                <div id="warning"></div>
    
                <div>
                    <form id="local-gunfight-form" class="form">
                        <div>
                            <label for="player-1" id="player-1-label" class="form-label">${player} 1</label>
                            <input type="text" id="player-1" class="form-input">
                        </div>
                        <div>
                            <label for="player-2" id="player-2-label" class="form-label">${player} 2</label>
                            <input type="text" id="player-2" class="form-input">
                        </div>
                        <div id="button-div">
                            <button type="submit" id="submit-local-gunfight" class="submit-button">${start}</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const submitButton = this.querySelector('#submit-local-gunfight');
        const player1Input = this.querySelector("#player-1");
        const player2Input = this.querySelector("#player-2");
        const warning = this.querySelector("#warning");

        submitButton.addEventListener('click', e => {
            e.preventDefault();

            if (player1Input.value.trim() === "") {
                warning.innerHTML = "empty player 1";
                return;
            }
            if (player2Input.value.trim() === "") {
                warning.innerHTML = "empty player 2";
                return;
            }
            if (player1Input.value.match("^[a-zA-Z0-9]+$") === null) {
                warning.innerHTML = "invalid player 1";
                return;
            }
            if (player2Input.value.match("^[a-zA-Z0-9]+$") === null) {
                warning.innerHTML = "invalid player 2";
                return;
            }

            changeRoute(encodeURI(`/gunfight/local/game?player1=${player1Input.value}&player2=${player2Input.value}`));
        });
    }
}
