import LocalCowboy from "/all-games-fronts/game-srcs/classes/LocalCowboy.js";
import LocalBullet from "/all-games-fronts/game-srcs/classes/LocalBullet.js";
import LocalCactus from "/all-games-fronts/game-srcs/classes/LocalCactus.js";
import LocalTree from "/all-games-fronts/game-srcs/classes/LocalTree.js";
import LocalTrailer from "/all-games-fronts/game-srcs/classes/LocalTrailer.js";

export default class LocalGunfight extends EventTarget{
    constructor(player_1, player_2, canvas) {
        super();
        this.player_1 = player_1;
        this.player_2 = player_2;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.context.imageSmoothingEnabled = false;
        this.context.fillStyle = "yellow";
        this.bullets = [];
        this.cacti = [];
        this.trees = [];
        this.trailer = null;
        this.onEnd = () => { };
        this.map = null;
        this.currentMap = 0;
    }

    run () {
        this.scores = {
            player1: 0,
            player2: 0
        }
        this.player1Cowboy = new LocalCowboy(
            1,
            {
                up: 87,
                down: 83,
                right: 68,
                left: 65,
                shoot: 32
            },
            this.context
        )
        this.player2Cowboy = new LocalCowboy(
            -1,
            {
                up: 38,
                down: 40,
                right: 39,
                left: 37,
                shoot: 13
            },
            this.context
        )
        this.lifeInterval = setInterval(() => {
            if (parseInt(this.player1Cowboy.lifePoints) !== parseInt(this.player1Cowboy.lifePoints - 0.1)) {
                this.player1Cowboy.hit();
            }
            this.player1Cowboy.lifePoints -= 0.1;

            if (parseInt(this.player2Cowboy.lifePoints) !== parseInt(this.player2Cowboy.lifePoints - 0.1)) {
                this.player2Cowboy.hit();
            }
            this.player2Cowboy.lifePoints -= 0.1;
        }, 1000);
        this.interval = setInterval(() => {
            this.update();
            this.draw();
        }, 100/6);
        window.addEventListener("keydown", event => this.input(event));
        window.addEventListener("keyup", event => this.input(event));
        window.addEventListener("blur", event => this.input(event));
        this.player1Cowboy.addEventListener("shoot", event => this.spawnBullet(1, event.detail));
        this.player2Cowboy.addEventListener("shoot", event => this.spawnBullet(-1, event.detail));
        this.player1Cowboy.addEventListener("hit", () => {
            this.scores.player2++;
            this.player1Cowboy.dead = false;
            this.restart();
        });
        this.player2Cowboy.addEventListener("hit", () => {
            this.scores.player1++;
            this.player2Cowboy.dead = false;
            this.restart();
        });
        fetch(`/all-games-fronts/game-srcs/assets/maps/test.json`)
            .then(res => res.json())
            .then(data => {
                this.maps = data;
                this.restart();
            });
    }

    loadNextMap() {
        this.cacti = [];
        this.trees = [];
        this.trailer = null;
        if ('cacti' in this.maps[this.currentMap])
            this.cacti = this.maps[this.currentMap]['cacti'].map(cactus => new LocalCactus({x: cactus[0], y: cactus[1]}, this.context));
        if ('trees' in this.maps[this.currentMap])
            this.trees = this.maps[this.currentMap]['trees'].map(cactus => new LocalTree({x: cactus[0], y: cactus[1]}, this.context));
        if ('trailer' in this.maps[this.currentMap]) {
            if (this.maps[this.currentMap]['trailer'])
                this.trailer = new LocalTrailer({x: 417, y: 50}, this.context);
        }
        this.currentMap++;
        this.currentMap %= this.maps.length;
    }

    restart() {
        this.player1Cowboy.bullets = 9;
        this.player2Cowboy.bullets = 9;
        this.loadNextMap();
    }

    input(event) {
        if (event.repeat)
            return;
        this.player1Cowboy.input(event);
        this.player2Cowboy.input(event);
    }

    update() {
        if (this.player1Cowboy.lifePoints <= 0)
            this.stop();
        if (this.player2Cowboy.lifePoints <= 0)
            this.stop();
        this.player1Cowboy.update();
        this.player2Cowboy.update();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.bullets = this.bullets.filter(bullet => bullet.update(
            this.cacti,
            this.trees,
            this.trailer,
            [this.player1Cowboy, this.player2Cowboy]
        ));
        if (this.trailer)
            this.trailer.update();
        this.cacti = this.cacti.filter(cactus => cactus.rect.height > 5);
    }

    draw() {
        this.player1Cowboy.draw();
        this.player2Cowboy.draw();
        for (let idx in this.cacti) {
            this.cacti[idx].draw();
        }
        for (let idx in this.trees) {
            this.trees[idx].draw();
        }
        for (let idx in this.bullets) {
            this.bullets[idx].draw();
        }
        if (this.trailer)
            this.trailer.draw();
    }

    spawnBullet(dir, pos) {
        this.bullets.push(new LocalBullet(pos, dir, this.context));
    }

    stop() {
        this.player1Cowboy.stop();
        this.player2Cowboy.stop();
        clearInterval(this.interval);
        clearInterval(this.lifeInterval);
        let winner = this.player_1;
        let looser = this.player_2;
        if (this.player1Cowboy.lifePoints <= 0) {
            winner = this.player_2;
            looser = this.player_1;
        }
        this.dispatchEvent(new CustomEvent('end_game', {
            detail: {
                winner: winner,
                looser: looser
            }
        }))
    }
}
