import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class CustomPongSelector extends HTMLElement
{
	constructor()
	{
		super();
	}
	async connectedCallback()
	{
		let local = await lang.games_selector.local[getCookie("lang")];
		let online = await lang.games_selector.online[getCookie("lang")];
		let freeplay = await lang.games_selector.freeplay[getCookie("lang")];
		let	tournament = await lang.games_selector.tournament[getCookie("lang")];

		this.innerHTML =
			`
			<link rel="stylesheet" href="/styles/gameSelector.css" >
			<h2 id="title-text">PONG</h2>
			<div class="selector-container">
				<div id="choice">
					<div id="local">
						<h3 class="mode-title">${local}</h3>
						<link-route route="/pong/local/form" id="freeplay-local" class="text">${freeplay}</link-route>
						<link-route route="/pong/local/tournament" id="tournament-local" class="text">${tournament}</link-route>
					</div>
					<div id="red-line"></div>
					<div id="online">
						<h3>${online}</h3>
						<link-route route="/pong/remote/matchmaking" id="freeplay-online" class="text">${freeplay}</link-route>
					</div>
				</div>
				<div class="commands-container">
					<link-route class="mode-title" route="/pong/commands"><h4>How to play</h4></link-route>
				</div>
			</div>
			`
	}
}
