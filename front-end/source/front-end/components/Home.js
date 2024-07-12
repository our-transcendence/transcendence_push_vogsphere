import changeRoute from "../utils/changeRoute";
import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class Dashboard extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback() {
		let Game_title = await lang.home_page.Game_title[getCookie("lang")];
		let Pong_button = await lang.home_page.Pong_button[getCookie("lang")];
		let Gunfight_button = await lang.home_page.Gunfight_button[getCookie("lang")];
		let Add_friend_button = await lang.home_page.Add_friend_button[getCookie("lang")];
		let Stats_link = await lang.home_page.Stats_link[getCookie("lang")];
		let delete_friend_button = await lang.home_page.Delete_friend_button[getCookie("lang")];
		let See_friend_stats_button = await lang.home_page.See_friend_stats_button[getCookie("lang")];
		this.innerHTML = `
			<link rel="stylesheet" href="/styles/home.css" >
			<h2 id="play-text">${Game_title}</h2>
			<div id="games">
				<link-route route="/pong/modeSelector" id="pong">${Pong_button}</link-route>
				<link-route route="/gunfight/modeSelector" id="gunfight">${Gunfight_button}</link-route>
			</div>
			<p id="seeYourStats">${Stats_link}</p>
			<div id="parent-red-line">
				<div id="red-line"></div>
			</div>
			<div id="friend-list">
				<div id="add-friend"><img src="https://${location.hostname}:4443/imgs/addFriend.svg" alt=""><p class="friend-text">${Add_friend_button}</p></div>
			</div>
		`;

		window.addEventListener('socket-message', (e) =>
		{
			e.preventDefault();
			const msg = e.detail.message;
			const json = JSON.parse(msg);
			const	friendELM = document.querySelector(`#friend${json.from}`);
			if (!friendELM)
				return ;
			const	status = friendELM.querySelector(".status");
			if (json.status === "disconnected")
				status.style.backgroundColor = "#C82611";
			else
				status.style.backgroundColor = "#00CB00";
		});

		window.addEventListener('storage', (e) => {
			const infos = JSON.parse(sessionStorage.getItem('user_infos'));
		});

		const see_stat = document.querySelector("#seeYourStats")
		see_stat.addEventListener("click", e =>
		{
			e.preventDefault();
			document.cookie=`stat=${getCookie('user_id')}`;
			changeRoute("/stats");
		})

		await DisplayFriends();

		const add_friends = document.querySelector("#add-friend");
		add_friends.addEventListener('click', e =>
		{
			e.preventDefault();
			changeRoute('/friends');
		})

		async function DisplayFriends()
		{
			const header = {"Content-Type": "application/json; charset=UTF-8",}
			fetch(`https://${location.hostname}:4646/friends/`,
				{
					method: "GET",
					headers: header,
					body: null,
					credentials: "include"
				}).then(res =>
			{
				if (res.status == 200)
						return res.json()
			}).then(json =>
			{
				if (json && json.length != 0)
				{
					const friendList = document.querySelector("#friend-list");

					const MyId = getCookie("user_id");
					const keys = Object.keys(json);
					for (let i = 0; i < keys.length; i++)
					{
						if (json[keys[i]].accepted == true)
						{
							const MyDiv = document.createElement("div");
							MyDiv.className = "friend";
							let friendId = json[keys[i]].receiver;
							if (json[keys[i]].receiver == MyId)
								friendId = json[keys[i]].sender;

							GetPdpFriend(friendId).then(res =>
							{
								if (res != null)
									return res.blob();
							}).then(blob =>
							{
								const pdp = document.createElement("img");
								const url = URL.createObjectURL(blob);
								pdp.src = url;
								const name = document.createElement("p");
								pdp.className = "friend-imgs";
								name.className = "friend-text";
								fetch(`https://${location.hostname}:4646/${friendId}/infos/`,
									{
										method: "GET",
										body: null,
										headers: {"Content-Type": "application/json; charset=UTF-8",}
									}).then(res =>
								{
									if (res)
										return (res.json())
								}).then(json =>
								{
									console.log(json);
									const status = document.createElement("div");
									status.className = "status";
									status.style.backgroundColor = "#00CB00";

									if (json.status == "disconnected")
										status.style.backgroundColor = "#C82611";
									MyDiv.id = "friend" + friendId;
									MyDiv.name = friendId;
									if (json.displayName.length > 7)
										json.displayName = json.displayName.slice(0, 7) + ".";
									name.innerText = `${json.displayName}`;
									MyDiv.appendChild(status);
									MyDiv.appendChild(pdp);
									MyDiv.appendChild(name);
									friendList.prepend(MyDiv);
									const buttonDiv = document.createElement("div");
									buttonDiv.className = "buttonDiv";
									buttonDiv.name = MyDiv.name;
									MyDiv.appendChild(buttonDiv);
									DeleteFriend(MyDiv, buttonDiv);
									SeeFriends(MyDiv, buttonDiv);
								})
							});
						}
					}
				}
			}).catch(err =>
			{
				console.error(err);
			})
		}

		function SeeFriends(MyDiv, buttonDiv)
		{
			MyDiv.addEventListener("click", e =>
			{
				e.preventDefault()
				const MyButton = document.querySelector(`#stat${MyDiv.name}`);
				if (MyButton == null)
				{
					const button = document.createElement("button");
					button.className = "friendButtons";
					button.innerText = See_friend_stats_button;
					button.id = `stat${MyDiv.name}`
					console.log(buttonDiv);
					buttonDiv.appendChild(button);
					button.addEventListener("click", e =>
					{
						e.preventDefault();
						document.cookie=`stat=${MyDiv.name}`;
						changeRoute("/stats");
					})
				}
				else
					MyButton.remove();
			})
		}

		function DeleteFriend(MyDiv, buttonDiv)
		{
			MyDiv.addEventListener("click", e =>
			{
				e.preventDefault();
				const MyButton = document.querySelector(`#button${MyDiv.name}`);
				if (MyButton == null)
				{
					const button = document.createElement("button");
					button.className = "friendButtons deleteFriendButton";
					button.innerText = delete_friend_button;
					button.id = `button${MyDiv.name}`
					buttonDiv.appendChild(button);
					button.addEventListener("click", e =>
					{
						e.preventDefault();
						const header = {"Content-Type": "application/json; charset=UTF-8",}
						fetch(`https://${location.hostname}:4646/delete_friend/${MyDiv.name}/`,
							{
								headers: header,
								method: "DELETE",
								body: null,
								credentials: "include"
							}).then(res =>
						{
							if (res.status == 200)
								location.reload();
						}).catch(err =>
						{
							console.error(err);
						});
					})
				}
				else
					MyButton.remove();
			})
		}

		async function GetPdpFriend(id)
		{
			try
			{
				const header = {
					"Content-Type": "image/png",
				};
				const res = await fetch(`https://${location.hostname}:4646/${id}/picture/`, {
					method: "GET",
					credentials: 'include',
					body: null,
					headers: header,
				});
				return (res);
			}
			catch (err)
			{
				console.log(err);
				return (err);
			}
		}

	}
}
