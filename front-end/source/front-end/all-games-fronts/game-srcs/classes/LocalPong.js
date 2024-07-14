import LocalPaddle from "/all-games-fronts/game-srcs/classes/LocalPaddle.js";
import Rect from "/all-games-fronts/game-srcs/classes/Rect.js";
import Ball from "/all-games-fronts/game-srcs/classes/Ball.js";

export default class LocalPong {
    constructor(player_1, player_2, canvas) {
        this.player_1 = player_1;
        this.player_2 = player_2;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.onEnd = () => { };
    }

    run() {
        this.scores = {
            player1: 0,
            player2: 0
        }
        this.player1Paddle = new LocalPaddle(
            "white",
            new Rect(20, 0, 10, 100),
            1,
            {up: 87, down: 83},
            this.context
        );
        this.player2Paddle = new LocalPaddle(
            "white",
            new Rect(this.canvas.width - 10 - 20, 0, 10, 100),
            -1,
            {up: 38, down: 40},
            this.context
        );
        this.ball = new Ball(
            "white",
            Rect.center(this.canvas.width, this.canvas.height, 15, 15),
            this.context
        );

        const handleInputs = (event) => this.input(event);
        document.addEventListener("keydown", handleInputs);
        document.addEventListener("keyup", handleInputs);

        this.interval = setInterval(() => {
            this.player1Paddle.update(this.ball);
            this.player2Paddle.update(this.ball);
            this.ball.update();

            this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.player1Paddle.draw(this.context);
            this.player2Paddle.draw(this.context);
            this.ball.draw();
            this.draw();

            if (this.ball.rect.posX < 0) {
                this.scores.player2 += 1;
                if (this.scores.player2 >= 5) {
                    clearInterval(this.interval);
                    document.removeEventListener("keydown", handleInputs);
                    document.removeEventListener("keyup", handleInputs);
                    this.onEnd(this.player_2, this.scores);
                    return;
                }
                this.ball = new Ball(
                    "white",
                    Rect.center(this.canvas.width, this.canvas.height, 15, 15),
                    this.context
                );
            }
            if (this.ball.rect.posX > this.canvas.width) {
                this.scores.player1 += 1;
                if (this.scores.player1 >= 5) {
                    clearInterval(this.interval);
                    document.removeEventListener("keydown", handleInputs);
                    document.removeEventListener("keyup", handleInputs);
                    this.onEnd(this.player_1, this.scores);
                    return;
                }
                this.ball = new Ball(
                    "white",
                    Rect.center(this.canvas.width, this.canvas.height, 15, 15),
                    this.context
                );
            }
        }, 100/6);
    }

    input(event) {
        if (!event.repeat) {
            this.player1Paddle.input(event);
            this.player2Paddle.input(event);
        }
    }

    draw() {
        this.context.fillStyle = "white";
        this.context.textAlign = "center";
        this.context.textBaseline = "top";
        this.context.font = "25px sans-serif";

        this.context.fillText(`${this.scores.player1}:${this.scores.player2}`, this.canvas.width / 2, 0);

        this.context.textAlign = "left";
        this.context.fillText(this.player_1, 10, 0);

        this.context.textAlign = "right";
        this.context.fillText(this.player_2, this.canvas.width - 10, 0);
    }
}