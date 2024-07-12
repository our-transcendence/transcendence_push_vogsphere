import changeRoute from "../utils/changeRoute";
import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class CustomTournamentGunfight extends HTMLElement {
	constructor()
	{
		super();
	}

	async connectedCallback()
	{
		let playerstxt = await lang.tournaments.players[getCookie("lang")];
		let play = await lang.tournaments.play[getCookie("lang")];
		let player = await lang.tournaments.player[getCookie("lang")];
		let winner_is = await lang.tournaments.winner_is[getCookie("lang")];
		let go_back_to_dashboard = await lang.tournaments.go_back_to_dashboard[getCookie("lang")];
		let Loosers = await lang.tournaments.loosers[getCookie("lang")];
		let Winners = await lang.tournaments.winners[getCookie("lang")];
		let launch_game = await lang.tournaments.launch_game[getCookie("lang")];
		let against = await lang.tournaments.against[getCookie("lang")];
		let next_game = await lang.tournaments.next_game[getCookie("lang")];

		this.innerHTML =
			`
				<link rel="stylesheet" href="/styles/tournament.css">
				<div class="container d-flex justify-content-center align-items-center" id="divTournament">
					<form id="tournament-form">
						<div class="form-check">
							<input class="form-check-input" type="radio" value="4" id="4" name="nbPlayers">
							<label class="form-check-label" for="4">4 ${playerstxt}</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="radio" value="8" id="8" name="nbPlayers">
							<label class="form-check-label" for="8">8 ${playerstxt}</label>
						</div>
						<div class="form-check">
							<input class="form-check-input" type="radio" value="16" id="16" name="nbPlayers">
							<label class="form-check-label" for="16">16 ${playerstxt}</label>
						</div>
			        	<button type="submit" class="play-button">${play}</button>
					</form>
				</div>
			`

		class TournamentPlayer
		{
			constructor(name, id)
			{
				this._name = name;
				this._id = id;
				this._hasPlay = false;
			}

			getName(){return (this._name);}
			getId(){return (this._id);}
			getNbVictory(){return (this._nbVictory);}
			getNbDeafet(){return (this._nbDeafet);}
			getPlayAgainst(){return (this._playAgainst);}
			getHasPlay() {return (this._hasPlay);}

			setHasPlay(hasPlay){this._hasPlay = hasPlay;}
			incrementVictory(){this._nbVictory++;}
			incrementDeafet(){this._nbDeafet++;}
			setPlayAgainst(name){this._playAgainst = name;}
			_name;
			_id;
			_hasPlay;
			_nbVictory = 0;
			_nbDeafet = 0;
			_playAgainst = null;
		}

		addTournament();
		function addTournament()
		{
			const content = document.querySelector("local-gunfight-tournament");
			const formTournament = document.querySelector("#tournament-form");
			formTournament.addEventListener("submit", e =>
			{
				let players = [];
				e.preventDefault();
				const Players = document.querySelector('input[name="nbPlayers"]:checked').value;
				if (Players == null)
					return ;
				formTournament.style.display="none";
				let formName = document.createElement("form");
				formName.id = "formName";
				for (let i = 0; i < Players; i++)
				{
					let inDiv = document.createElement("div");
					inDiv.className = "mb-3";
					let label = document.createElement("label")
					label.for = "player" + i;
					label.className = "form-label";
					label.innerText = playerstxt + " " + i;
					let input = document.createElement("input");
					players.push(input);
					input.type = "text";
					input.id = "player" + i;
					input.placeholder = "enter your name";
					input.className = "form-input";
					inDiv.appendChild(label);
					inDiv.appendChild(input);
					formName.appendChild(inDiv);
				}
				let button = document.createElement("button");
				button.type = "submit";
				button.className = "play-button";
				button.innerText = play;
				formName.appendChild(button);
				let divTournament = document.querySelector("#divTournament");
				divTournament.appendChild(formName);
				AddPlayers(formName, players, Players);
			})
		}

//TODO ERROR MESSAGE

		async function AddPlayers(formPlayer, PlayersObj, NbPlayers)
		{
			formPlayer.addEventListener("submit", event =>
			{

				event.preventDefault();
				let PlayerTab = [];
				let i = 0;
				PlayersObj.forEach(Player =>
				{
					if (Player.value == "")
						return ;
					let myPlayers = new TournamentPlayer(Player.value, i);
					PlayerTab.push(myPlayers);
					i++;
				});
				if (PlayerTab.length != NbPlayers)
				{
					console.log(PlayerTab.length);
					console.log(NbPlayers);
					return ;
				}
				Matchmaking(PlayerTab);
			})
		}

		async function Matchmaking(PlayerTab)
		{
			let ExcludeNumber = [];
			let Matchmaking = [];
			for (let i = 0; i < PlayerTab.length; i++)
			{
				const	player1 = randomInt(0, PlayerTab.length - 1, ExcludeNumber);
				ExcludeNumber.push(player1);
				const 	player2 = randomInt(0, PlayerTab.length - 1, ExcludeNumber);
				ExcludeNumber.push(player2);

				if (player1 == -1 || player2 == -1)
					break ;

				PlayerTab[player1].setHasPlay(false);
				PlayerTab[player2].setHasPlay(false);
				PlayerTab[player1].setPlayAgainst(PlayerTab[player2].getId());
				PlayerTab[player2].setPlayAgainst(PlayerTab[player1].getId());
				Matchmaking.push(player1);
				Matchmaking.push(player2);
			}
			while (Matchmaking.length != 2)
			{
				for (let i = 0; i < PlayerTab.length; i++)
				{
					await LaunchGame(PlayerTab, i);
					await PlayGame(PlayerTab, i);
				}
				DisplayLoosersAndWinners(PlayerTab, Matchmaking);
				Matchmaking = NewMatchmaking(PlayerTab, Matchmaking);
			}
			if (Matchmaking.length == 2)
			{
				for (let i = 0; i < PlayerTab.length; i++)
				{
					await LaunchGame(PlayerTab, i);
					await PlayGame(PlayerTab, i);
				}
				DisplayLoosersAndWinners(PlayerTab, Matchmaking);
				console.log ("All Games are played");
			}
			let content = document.querySelector("local-gunfight-tournament");
			content.innerHTML = "<link rel=\"stylesheet\" href=\"/styles/tournament.css\">";
			const winner = document.createElement("p");
			for (let i = 0; i < PlayerTab.length; i++)
			{
				if (PlayerTab[i].getNbDeafet() == 0)
				{
					winner.innerText = `${winner_is} ${PlayerTab[i].getName()}!`
					break ;
				}
			}
			const button = document.createElement("button");
			button.id = "nextGame";
			button.innerText = go_back_to_dashboard;
			const displayDiv = document.createElement('div');
			displayDiv.id = "finishTournament";
			displayDiv.appendChild(winner);
			displayDiv.appendChild(button);
			content.appendChild(displayDiv);
			button.addEventListener("click", () => {
				changeRoute("/home");
			});
		}

		function DisplayLoosersAndWinners(PlayerTab, Matchmaking)
		{
			const content = document.querySelector("local-gunfight-tournament")
			content.innerHTML = "<link rel=\"stylesheet\" href=\"/styles/tournament.css\">";
			const loosersDiv = document.createElement("div");
			const loosers = document.createElement("h2");
			loosers.innerText = `${Loosers}:`;
			loosersDiv.appendChild(loosers);
			for (let i = 0; i < Matchmaking.length; i++)
			{
				if (PlayerTab[Matchmaking[i]].getNbDeafet() > 0)
				{
					let p = document.createElement("p")
					p.innerText = `${PlayerTab[Matchmaking[i]].getName()}`
					loosersDiv.appendChild(p);
				}
			}
			const winnerDiv = document.createElement("div");
			const winners = document.createElement("h2");
			winners.innerText = `${Winners}:`;
			winnerDiv.appendChild(winners);
			for (let i = 0; i < Matchmaking.length; i++)
			{
				if (PlayerTab[Matchmaking[i]].getNbDeafet() === 0)
				{
					let p = document.createElement("p")
					p.innerText = `${PlayerTab[Matchmaking[i]].getName()}`
					winnerDiv.appendChild(p);
				}
			}
			loosersDiv.className = "loosersWinners";
			winnerDiv.className = "loosersWinners"
			content.appendChild(loosersDiv);
			content.appendChild(winnerDiv);
		}

		async function LaunchGame(PlayerTab, i)
		{
			const tournamentForm = document.querySelector("#divTournament");
			if (tournamentForm)
				tournamentForm.remove();
			const formName = document.querySelector("#formName");
			if (formName)
				formName.remove();
			if (PlayerTab[i].getHasPlay() || PlayerTab[PlayerTab[i].getPlayAgainst()].getHasPlay())
				return ;
			const divAnouce = document.createElement("div");
			divAnouce.id = "announce";
			const button = document.createElement("button");
			button.innerText = launch_game;
			button.className = "play-button";
			const	content = document.createElement("p");
			content.innerText = `${PlayerTab[i].getName()} ${against} ${PlayerTab[PlayerTab[i].getPlayAgainst()].getName()}`;
			const body = document.querySelector("local-gunfight-tournament");
			divAnouce.appendChild(content);
			divAnouce.appendChild(button);
			body.appendChild(divAnouce);
			return (new Promise(resolve => {
				button.addEventListener("click", e =>
				{
					e.preventDefault();
					resolve();
				}, { once: true });
			}))
		}

		async function PlayGame(PlayerTab, player)
		{
			let content = document.querySelector("local-gunfight-tournament");
			const LaunchGame = document.createElement("local-gunfight");

			if (PlayerTab[player].getHasPlay() || PlayerTab[PlayerTab[player].getPlayAgainst()].getHasPlay())
				return ;
			content.innerHTML = "<link rel=\"stylesheet\" href=\"/styles/tournament.css\">";
			LaunchGame.setAttribute("player_1", `${PlayerTab[player].getId()}:${PlayerTab[player].getName()}`);
			LaunchGame.setAttribute("player_2", `${PlayerTab[PlayerTab[player].getPlayAgainst()].getId()}:${PlayerTab[PlayerTab[player].getPlayAgainst()].getName()}`);
			content.appendChild(LaunchGame);
			return (new Promise(resolve =>
			{
				LaunchGame.addEventListener("endGame", e =>
				{
					if (e.target.winner == `${PlayerTab[player].getId()}:${PlayerTab[player].getName()}`)
					{
						PlayerTab[player].incrementVictory();
						PlayerTab[PlayerTab[player].getPlayAgainst()].incrementDeafet();
					}
					else
					{
						PlayerTab[player].incrementDeafet();
						PlayerTab[PlayerTab[player].getPlayAgainst()].incrementVictory();
					}
					PlayerTab[player].setHasPlay(true);
					PlayerTab[PlayerTab[player].getPlayAgainst()].setHasPlay(true);
					content.innerHTML = "<link rel=\"stylesheet\" href=\"/styles/tournament.css\">";
					const divResult = document.createElement('div');
					divResult.id = "result";
					const winner = document.createElement("p");
					winner.innerText = `${winner_is} ${e.target.winner}!`;
					const button = document.createElement("button");
					button.id = "nextGame";
					button.innerText = next_game;
					divResult.appendChild(winner);
					divResult.appendChild(button);
					content.appendChild(divResult);
					button.addEventListener("click", () => {
						resolve();
					});
				}, { once: true });
			}));
		}

		function NewMatchmaking(PlayerTab, Matchmaking)
		{
			let SaveMatchmaking = [];

			for (let i = 0; i < PlayerTab.length; i++)
			{
				if (PlayerTab[i].getNbDeafet() == 0)
				{
					SaveMatchmaking.push(PlayerTab[i].getId());
				}
			}
			Matchmaking = SaveMatchmaking;
			for (let i = 0; i < Matchmaking.length; i++)
			{
				if ((i == 0 || i % 2 == 0) && i < Matchmaking.length)
				{
					PlayerTab[Matchmaking[i]].setHasPlay(false);
					PlayerTab[Matchmaking[i]].setPlayAgainst(PlayerTab[Matchmaking[i + 1]].getId());
				}
				else if (i % 2 != 0)
				{
					PlayerTab[Matchmaking[i]].setHasPlay(false);
					PlayerTab[Matchmaking[i]].setPlayAgainst(PlayerTab[Matchmaking[i - 1]].getId());
				}
			}
			return (Matchmaking);
		}

		function randomInt(min, max, exclude) {
			const nums = [];
			const excludeLookup = new Set(exclude);
			for (let i = min; i <= max; i++)
			{
				if (!excludeLookup.has(i))
					nums.push(i);
			}
			if (nums.length === 0)
				return -1;

			const randomIndex = Math.floor(Math.random() * nums.length);
			return nums[randomIndex];
		}
	}
}
