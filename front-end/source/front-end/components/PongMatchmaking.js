import Matchmaking from "./Matchmaking.js";
import changeRoute from "../utils/changeRoute";

export default class PongMatchmaking extends Matchmaking {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();

        this.ws = new WebSocket(`wss://${window.location.hostname}:5151/join/`);
        this.ws.addEventListener("open", () => {
            this.ws.send(`{"game": "pong"}`);
        });
        this.ws.addEventListener("message", (e) => {
            // console.info(e);
            const data = JSON.parse(e.data);
            if (!data.hasOwnProperty("gamePort")) {
                return;
            }
            this.joining();
            this.timeout = setTimeout(() => {
                if (data.gamePort) {
                    changeRoute(`/pong/remote/game?gamePort=${data.gamePort.toString()}`);
                } else {
                    changeRoute(`/home`);
                }
            }, 1000);
        })
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.ws) {
            this.ws.close();
        }
    }
}
