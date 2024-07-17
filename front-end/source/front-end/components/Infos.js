import updateInfos from "/utils/updateInfos.js";
import changeRoute from "/utils/changeRoute.js";
import getCookie from "../utils/getCookie";
import { lang } from "../utils/getAllLang";

export default class Settings extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback()
    {
        let statistics = lang.stats.statistics[getCookie("lang")];
        let history = lang.stats.history[getCookie("lang")];
        let winnings = lang.stats.winnings[getCookie("lang")];
        let looses = lang.stats.looses[getCookie("lang")];
        let game = lang.stats.game[getCookie("lang")];
        this.user_id = parseInt(location.pathname.substring(1));

        this.innerHTML = `
        <link rel="stylesheet" href="/styles/stats.css">
		<h2 id="title-setting">${statistics}</h2>
        <h3 class="microTitle"> ${statistics} </h3><br>
        <div id="stat">
        	<div id="pongStat">
        		<h3 class="titleText">PONG</h3>
        		<p id="pongelo" class="text"></p>
        		<p id="pongwins" class="text"></p>
        		<p id="ponglooses" class="text"></p>
			</div>
        	<div id="gunStat">
        		<h3 class="titleText">GUNFIGHT</h3>
        		<p id="gunelo" class="text"></p>
        		<p id="gunwins" class="text"></p>
        		<p id="gunlooses" class="text"></p>
			</div>
        </div>
        <div></div>
        <h3 class="microTitle"> ${history} </h3><br>
        <div id="stat">
        	<div id="pongHistory">
        		<h3 class="titleText">PONG</h3>
        		<p id="pongHistoryText"></p>
        		<div class="scrollableContent" id="forPongHistory"></div>
			</div>
        	<div id="gunHistory">
        		<h3 class="titleText">GUNFIGHT</h3>
        		<p id="gunHistoryText"></p>
        		<div class="scrollableContent" id="forGunfightHistory"></div>
			</div>
        </div>
		<div style="height: 50px"></div>
        `;

        if (!getCookie("lang")) document.cookie = "lang=en";
        GetStats(this.user_id);
        GetHistory(this.user_id);

        const title = document.querySelector("#title-setting");
        fetch(`https://${location.hostname}:4646/${this.user_id}/infos/`, {
            method: "GET",
            body: null,
            headers: {"Content-Type": "application/json; charset=UTF-8",}
        }).then(res => {
            return res.json()
        }).then(json =>
        {
            title.innerText = json.displayName;
        })
        function GetHistory(user_id) {
            const header = {
                "Content-Type": "application/json; charset=UTF8",
            };
            const uri = `https://${location.hostname}:4343/player?player_id=${user_id}`;
            fetch(uri, {
                method: "GET",
                headers: header,
                body: null,
            })
                .then((res) => {
                    return res.json();
                })
                .then((json) => {
                    if (json.length <= 0)
                        return ;
                    const appendToPong = document.querySelector("#forPongHistory");
                    const appendToGunfight = document.querySelector("#forGunfightHistory");
                    for (let i = 0; i < json.length; i++)
                    {
                        const myDiv = document.createElement("div");
                        myDiv.className = "inScrool";

                        const player1Txt = document.createElement("p");
                        const player2Txt = document.createElement("p");
                        const Player1score = document.createElement("p");
                        const Player2score = document.createElement("p");
                        const Player1div	= document.createElement("div");
                        const Player2div	= document.createElement("div");
                        if (getCookie("user_id") == json[i].player_2.id)
                        {
                            const save = json[i].player_1;
                            json[i].player_1 = json[i].player_2;
                            json[i].player_2 = save;
                        }
                        if (json[i].player_1.id == getCookie('user_id'))
                        {
                            player1Txt.innerText = getCookie("displayName");
                            if (player1Txt.innerText.length > 7)
                                player1Txt.innerText = player1Txt.innerText.slice(0, 7) + ".";
                        }
                        else
                        {
                            fetch(`https://${location.hostname}:4646/${json[i].player_1.id}/infos/`,
                                {
                                    method: "GET",
                                    body: null,
                                    headers: {"Content-Type": "application/json; charset=UTF-8",}
                                }).then(res =>
                            {
                                return (res.json());
                            }).then(infos =>
                            {
                                if (infos.displayName.length > 7)
                                    infos.displayName = infos.displayName.slice(0, 7) + ".";
                                player1Txt.innerText = infos.displayName;
                            })
                        }
                        if (json[i].match_type === "pong")
                        {
                            Player1score.innerHTML = json[i].player_1.score;
                            Player2score.innerHTML = json[i].player_2.score;
                        }
                        else
                        {
                            if (json[i].player_1.score > json[i].player_2.score)
                            {
                                Player2score.innerHTML = "Looser";
                                Player1score.innerHTML = "Winner";
                            }
                            else
                            {
                                Player2score.innerHTML = "Winner";
                                Player1score.innerHTML = "Looser";
                            }
                        }
                        fetch(`https://${location.hostname}:4646/${json[i].player_2.id}/infos/`,
                            {
                                method: "GET",
                                body: null,
                                headers: {"Content-Type": "application/json; charset=UTF-8",}
                            }).then(res =>
                        {
                            return (res.json());
                        }).then(json0 =>
                        {
                            if (json0.displayName.length > 7)
                                json0.displayName = json0.displayName.slice(0, 7) + ".";
                            player2Txt.innerText = json0.displayName;

                            const title = document.createElement("h5");
                            title.innerText = `${game} ${i + 1}`;

                            myDiv.appendChild(title);
                            Player1div.appendChild(player1Txt);
                            Player1div.appendChild(Player1score);
                            Player2div.appendChild(player2Txt);
                            Player2div.appendChild(Player2score);
                            const FlexDiv = document.createElement("div");
                            FlexDiv.className = "flexDiv";
                            FlexDiv.appendChild(Player1div);
                            FlexDiv.appendChild(Player2div);
                            myDiv.appendChild(FlexDiv);
                            if (json[i].match_type === "pong")
                                appendToPong.prepend(myDiv);
                            else
                                appendToGunfight.prepend(myDiv);
                        }).catch(err => {return ;});
                    }
                });
        }

        function GetStats(user_id) {
            const header = {
                "Content-Type": "application/json; charset=UTF8",
            };
            fetch(`https://${location.hostname}:5151/stats/${user_id}/infos`, {
                method: "GET",
                headers: header,
                body: null,
            })
                .then((res) => {
                    return res.json();
                })
                .then((json) => {
                    const pongElo = document.querySelector("#pongelo");
                    const pongWins = document.querySelector("#pongwins");
                    const pongLooses = document.querySelector("#ponglooses");
                    pongElo.innerText = `ELO: ${json.pong.elo}`;
                    pongWins.innerText = `${winnings}: ${json.pong.wins}`;
                    pongLooses.innerText = `${looses}: ${json.pong.losses}`;

                    const gunElo = document.querySelector("#gunelo");
                    const gunWins = document.querySelector("#gunwins");
                    const gunLooses = document.querySelector("#gunlooses");
                    gunElo.innerText = `ELO: ${json.gunfight.elo}`;
                    gunWins.innerText = `${winnings}: ${json.gunfight.wins}`;
                    gunLooses.innerText = `${looses}: ${json.gunfight.losses}`;

                });
        }
    }
}
