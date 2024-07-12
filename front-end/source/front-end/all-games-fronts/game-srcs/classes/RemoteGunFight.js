import { io } from "/all-games-fronts/libs/socket.io.esm.min.js";
import LocalCowboy from "./LocalCowboy.js";
import LocalCactus from "./LocalCactus";
import LocalTree from "./LocalTree";
import LocalTrailer from "./LocalTrailer";
import RemoteCowboy from "./RemoteCowboy";
import Rect from "./Rect";
import LocalBullet from "./LocalBullet";
import RemoteBullet from "./RemoteBullet";

export default class RemoteGunfight extends EventTarget {
    constructor(canvas, gameAddr) {
        super();
        this.gameAddr = gameAddr;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
        this.scores = [0, 0];
        this.opponentSid = "";
        this.interval = null;
        this.localCowboy = new LocalCowboy(
            1,
            {
                up: 38,
                down: 40,
                right: 39,
                left: 37,
                shoot: 32
            },
            this.context
        );
        this.remoteCowboy = new RemoteCowboy(
            new Rect(858 - 10 - 20, 0, 23, 33),
            this.context
        )
        this.maps = null;
        this.cacti = [];
        this.trees = [];
        this.trailer = null;
        this.currentMap = 0;
        this.bullets = [];
    }

    run() {
        this.socket = io(this.gameAddr, {
            withCredentials: true,
            transports: ["websocket"],
        });
        this.setEventListeners();
    }

    spawnBullet(dir, pos, uid) {
        this.bullets.push(new RemoteBullet(pos, dir, uid, this.context));
    }

    setEventListeners() {
        this.socket.on("connect", () => {
            this.localCowboy.addEventListener("shoot", (e) => {
                this.socket.emit("shoot", e.detail);
            })
            this.socket.emit("ready");
        });
        this.socket.on("disconnect", () => {
            clearInterval(this.interval);
        });
        this.socket.on("connect_error", (err) => {
            this.socket.disconnect();
            if (err.type === undefined) {
                this.dispatchEvent(new Event("authError", {bubbles: true}));
            }
        });
        this.socket.on("connect_failed", (err) => {
            this.socket.disconnect();
            if (err.type === undefined) {
                this.dispatchEvent(new Event("authError", {bubbles: true}));
            }
        });
        this.socket.on("maps", (data) => {
            this.maps = data;
            this.currentMap = 0;
            this.loadMap();
        });
        this.socket.on("map_update", (data) => {
            this.currentMap = data;
            this.loadMap();
        });
        this.socket.on("trailer_update", (data) => {
            if (this.trailer === null)
                return;
            this.trailer.rect.posX = data[0];
            this.trailer.rect.posY = data[1];
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
            this.interval = setInterval(() => this.update(), 100 / 6);
        });
        this.socket.on("give_up", () => {
            alert("opponent gave up");
            this.socket.disconnect();
            this.onEnd(this.name, null);
        });
        this.socket.on("game_end", (data) => {
            this.winner = data[this.socket.id] > this.scores[this.opponentSid] ? this.playerData : this.opponentData;
            this.onEnd(this.winner, data);
        });
        this.socket.on("pos_up", (data) => {
            if (data.hasOwnProperty("pos") && data.hasOwnProperty("sid")) {
                if (data.sid === this.socket.id) {
                    this.localCowboy.rect.posX = data.pos[0];
                    this.localCowboy.rect.posY = data.pos[1];
                } else {
                    this.remoteCowboy.update(data.pos);
                }
            }
        });
        this.socket.on("shoot", (data) => {
            this.spawnBullet(data.dir, data, data.uid);
        });
        this.socket.on("destroy_bullet", (data) => {
            this.bullets = this.bullets.filter(bullet => bullet.uid !== data.uid);
        });
        this.socket.on("lp_update", (data) => {
            if (data.sid === this.socket.id)
                this.localCowboy.lifePoints = data.lp;
            else
                this.remoteCowboy.lifePoints = data.lp;
        })
        this.socket.on("bullets_update", (data) => {
            if (data.sid === this.socket.id)
                this.localCowboy.bullets = data.bullets;
            else
                this.remoteCowboy.bullets = data.bullets;
        })
        this.socket.on("die", (data) => {
            if (data.sid === this.socket.id)
                this.localCowboy.hit();
            else
                this.remoteCowboy.hit();
        });
        this.socket.on("end", (data) => {
            this.winner = data['winner'];
            this.onEnd(this.winner);
        })
        const handleInputs = (event) => this.input(event);
        window.addEventListener("keydown", handleInputs);
        window.addEventListener("keyup", handleInputs);
        window.addEventListener("blur", handleInputs);
        this.localCowboy.addEventListener("hit", () => {
            //this.scores.player2++;
            this.localCowboy.dead = false;
            //this.restart();
        });
        this.remoteCowboy.addEventListener("hit", () => {
            //this.scores.player1++;
            this.remoteCowboy.dead = false;
            //this.restart();
        });
    }

    update() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.localCowboy.update(this.ball);
        if (this.localCowboy.dir.y || this.localCowboy.dir.x) {
            this.socket.emit("pos_up", {"pos": [this.localCowboy.rect.posX, this.localCowboy.rect.posY]});
        }
        this.bullets = this.bullets.filter(bullet => bullet.update(
            this.cacti,
            this.trees,
            this.trailer,
            []
        ));
        this.draw();
    }

    loadMap() {
        this.currentMap %= this.maps.length;
        this.cacti = [];
        this.trees = [];
        this.trailer = null;
        if (Object.hasOwn(this.maps[this.currentMap], 'cacti'))
            this.cacti = this.maps[this.currentMap]['cacti'].map(cactus => new LocalCactus({x: cactus[0], y: cactus[1]}, this.context));
        if (Object.hasOwn(this.maps[this.currentMap], 'trees'))
            this.trees = this.maps[this.currentMap]['trees'].map(cactus => new LocalTree({x: cactus[0], y: cactus[1]}, this.context));
        if (Object.hasOwn(this.maps[this.currentMap], 'trailer')) {
            if (this.maps[this.currentMap]['trailer'])
                this.trailer = new LocalTrailer({x: 417, y: 50}, this.context);
        }
    }

    input(event) {
        if (!event.repeat) {
            this.localCowboy.input(event);
        }
    }

    draw() {
        this.localCowboy.draw();
        this.remoteCowboy.draw();
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
}