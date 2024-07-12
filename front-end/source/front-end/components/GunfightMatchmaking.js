import Matchmaking from "./Matchmaking.js";
import changeRoute from "../utils/changeRoute";

export default class GunfightMatchmaking extends Matchmaking {
    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
        console.log("Pong Matchmaking");

        const ws = new WebSocket(`wss://${window.location.hostname}:5151/join/`);
        ws.addEventListener("open", () => {
            console.info("connection open");
            ws.send(`{"game": "gunfight"}`);
        });
        ws.addEventListener("message", (e) => {
            console.info("Received message");
            console.info(e);
            const data = JSON.parse(e.data);
            if (!data.hasOwnProperty("gamePort")) {
                console.error("Invalid game port");
                return;
            }
            this.joining();
            this.timeout = setTimeout(() => {
                if (data.gamePort) {
                    changeRoute(`/gunfight/remote/game?gamePort=${data.gamePort.toString()}`);
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