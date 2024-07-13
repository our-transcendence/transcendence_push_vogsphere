import { io } from "/all-games-fronts/libs/socket.io.esm.min.js";

import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";
import LocalPaddle from "/all-games-fronts/game-srcs/classes/LocalPaddle.js";
import Ball from "./Ball.js";
import RemotePaddle from "/all-games-fronts/game-srcs/classes/RemotePaddle.js";
import RemoteBall from "/all-games-fronts/game-srcs/classes/RemoteBall.js";

export default class RemotePong extends EventTarget {
    constructor(canvas, gameAddr) {
        super();
        this.gameAddr = gameAddr;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.scores = [0, 0];
        this.opponentSid = "";
        this.playerData = null;
        this.opponentData = null;
        this.localPaddle = new LocalPaddle(
            "white",
            new Rect(20, 0, 10, 100),
            1,
            {up: 87, down: 83},
            this.context
        );
        this.opponentPaddle = new RemotePaddle(
            "white",
            new Rect(this.context.canvas.width - 10 - 20, 0, 10, 100),
            this.context
        );
        this.ball = undefined;
        this.interval = undefined;
    }

    run() {
        this.socket = io(this.gameAddr, {
            withCredentials: true,
            transports: ["websocket"]
        });
        this.setEventListeners();
    }

    setEventListeners() {
        this.socket.on("connect", () => {
            this.socket.emit("ready");
        });
        this.socket.on("disconnect", () => {
            clearInterval(this.interval);
        });
        this.socket.on("connect_error", (err) => {
            this.socket.disconnect();
            this.dispatchEvent(new Event("authError", {bubbles: true}));
        });
        this.socket.on("connect_failed", (err) => {
            this.socket.disconnect();
            this.dispatchEvent(new Event("authError", {bubbles: true}));
        });
        this.socket.on("in_queue", (data) => {
        });
        this.socket.on("leave_queue", () => {
        });
        this.socket.on("in_game", (data) => {
            this.opponentSid = data[0]['sid'];
            this.playerData = data[1];
            this.opponentData = data[0];
            if (this.opponentSid === this.socket.id) {
                this.opponentSid = data[1]['sid'];
                this.playerData = data[0];
                this.opponentData = data[1];
            }
            if (this.interval)
                clearInterval(this.interval);
            this.interval = setInterval(() => this.update(), 100/6);
        });
        this.socket.on("spawn_ball", (data) => {
            this.ball = new RemoteBall(
                "white",
                new Rect(data.x, data.y, data.size, data.size),
                this.context
            );
        })
        this.socket.on("pos_up", (data) => {
            if (data.sid === this.socket.id)
                this.localPaddle.rect.posY = data['pos']
            else
                this.opponentPaddle.rect.posY = data['pos'];
        });
        this.socket.on("ball_up", (data) => {
            if (this.ball === null)
                return;
            this.ball.rect.posX = data['pos']['x'];
            this.ball.rect.posY = data['pos']['y'];
        });
        this.socket.on("ball_dir_up", (data) => {
            if (this.ball === null)
                return;
            this.ball.dir.x = data['x'];
            this.ball.dir.y = data['y'];
        });
        this.socket.on("score_up", (data) => {
            this.scores[0] = data[this.socket.id];
            this.scores[1] = data[this.opponentSid];
        });
        this.socket.on("give_up", () => {
            alert("opponent gave up");
            this.socket.disconnect();
            this.onEnd(this.name, null);
        });
        this.socket.on("game_end", (data) => {
            this.winner = this.opponentData;
            if (data[this.socket.id] > data[this.opponentSid])
                this.winner = this.playerData;
            this.onEnd(this.winner, data);
        });
        const handleInputs = (event) => this.input(event);
        window.addEventListener("keydown", handleInputs);
        window.addEventListener("keyup", handleInputs);
        window.addEventListener("blur", handleInputs);
    }

    update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.localPaddle.update(this.ball);
        if (this.localPaddle.dir.y) {
            this.socket.emit("paddle_up", {"pos": this.localPaddle.rect.posY});
        }
        if (this.ball) {
            this.ball.update();
            this.ball.draw();
        }
        this.draw();
        this.localPaddle.draw();
        this.opponentPaddle.draw();
    }

    draw() {
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.textBaseline = "top";
        this.context.font = "bold 48px sans-serif";

        this.context.fillText(`${this.scores[0]}:${this.scores[1]}`, this.canvas.width / 2, 0);

        this.context.font = "bold 40px sans-serif";
        this.context.textAlign = "left";
        this.context.fillText(this.playerData['display_name'], 0, 0);

        this.context.textAlign = "right";
        this.context.fillText(this.opponentData['display_name'], this.canvas.width, 0);

        this.context.font = "bold 20px sans-serif";
        this.context.textAlign = "left";
        this.context.fillText(this.playerData['login'], 0, 40);

        this.context.textAlign = "right";
        this.context.fillText(this.opponentData['login'], this.canvas.width, 40);
    }

    input(event) {
        if (!event.repeat) {
            this.localPaddle.input(event);
        }
    }
}