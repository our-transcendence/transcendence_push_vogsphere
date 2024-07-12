export default class CustomGunfightSelector extends HTMLElement
{
    constructor()
    {
        super();
    }
    connectedCallback()
    {
        this.innerHTML =
            `
			<link rel="stylesheet" href="/styles/gameSelector.css" >
			<h2 id="title-text">gunfight</h2>
			<div id="choice">
				<div id="local">
					<h3 class="mode-title">LOCAL</h3>
					<link-route route="/gunfight/local/form" id="freeplay-local" class="text">FREEPLAY</link-route>
					<link-route route="/gunfight/local/tournament" id="tournament-local" class="text">TOURNAMENT</link-route>
				</div>
				<div id="red-line"></div>
				<div id="online">
					<h3>ONLINE</h3>
					<link-route route="/gunfight/remote/matchmaking" id="freeplay-online" class="text">FREEPLAY</link-route>
				</div>
			</div>
			`
    }
}
