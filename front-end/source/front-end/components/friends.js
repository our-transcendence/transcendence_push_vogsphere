import getCookie from '/utils/getCookie'
import changeRoute from "../utils/changeRoute";
import {lang} from "../utils/getAllLang";
export default class CustomFriends extends HTMLElement
{
	constructor()
	{
		super();
	}

	async connectedCallback()
	{
		let Search_button = await lang.friend_page.search_button[getCookie("lang")];
		let Search_result = await lang.friend_page.search_result[getCookie("lang")];
		let Sent_request = await lang.friend_page.sent_request[getCookie("lang")];
		let Pending_request = await lang.friend_page.pending_request[getCookie("lang")];
		let Send_request_button = await lang.friend_page.send_request_button[getCookie("lang")];
		let Accept_request_button = await lang.friend_page.accept_request_button[getCookie("lang")];
		let Decline_request_button = await lang.friend_page.decline_request_button[getCookie("lang")];
		let No_result = await lang.friend_page.no_result[getCookie("lang")];
		this.innerHTML =
			`
			<link rel="stylesheet" href="/styles/friends.css">
			<form id="search-friend">
				<input type="text" name="search" id="search-display-name">
				<button type="submit" id="search">${Search_button}</button>
			</form>
			<div id="result">
				<h2>${Search_result}</h2>
				<div id="friend-result">

				</div>
			</div>
			<div id="request">
				<h2>${Sent_request}</h2>
				<div id="friend-request">

				</div>
			</div>
			<div id="pending">
				<h2>${Pending_request}</h2>
				<div id="friend-pending">

				</div>
			</div>
			`
		await SearchFriends();
		await DisplayPendingFriends();
		await DisplayRequest();

		async function SearchFriends()
		{
			const search = document.querySelector("#search");

			search.addEventListener("click", e =>
			{
				e.preventDefault()

				const search_display_name = document.querySelector("#search-display-name").value;

				const header = {"Content-Type": "application/json; charset=UTF-8",}
				fetch(`https://${location.hostname}:4646/search/?search_for=${search_display_name}`,
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
					if (json && json.result)
						displayResult(json.result);
				}).catch(err =>
				{return ;});
			});
		}

		async function displayResult(result)
		{
			const resultDiv = document.querySelector("#friend-result");

			resultDiv.innerHTML = "";
			if (result.length == 0)
			{
				resultDiv.innerText = No_result;
				return ;
			}
			for (let i = 0; i < result.length; i++)
			{
				if (document.querySelector(`#friend${result[i].id}`) || result[i].id == getCookie("user_id"))
					continue ;
				let div = document.createElement("div");
				div.className = "result";
				GetPdpFriend(result[i].id).then(res =>
				{
					if (res != null)
						return res.blob();
				}).then(blob =>
				{
					const pdp = document.createElement("img");
					const url = URL.createObjectURL(blob);
					pdp.src = url;
					pdp.className = "pdp-add-friend";
					div.id = `friend${result[i].id}`;
					let login = document.createElement("p");
					login.innerText = result[i].login;
					let button = document.createElement("button");
					button.innerText = Send_request_button;
					button.name = result[i].id;
					button.className = "add-friend"
					div.appendChild(login);
					div.appendChild(pdp);
					div.appendChild(button);
					resultDiv.appendChild(div);
					sendRequest(button);
				});
			}
		}

		function sendRequest(button)
		{
			button.addEventListener("click", e =>
			{
				e.preventDefault();

				const header = {"Content-Type": "application/json; charset=UTF-8",}
				fetch(`https://${location.hostname}:4646/add_friend/${button.name}/`,
					{
						method: "POST",
						headers: header,
						body: null,
						credentials: "include"
					}).then(res =>
				{
					document.querySelector(`#friend${button.name}`).remove();
					DisplayRequest();
				}).catch(err =>
				{
					return ;
				});
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
				return (err);
			}
		}

		async function DisplayRequest()
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
				if (json.length != 0)
				{
					console.log ("aa");
					const friendList = document.querySelector("#friend-request");

					const MyId = getCookie("user_id");
					const keys = Object.keys(json);
					for (let i = 0; i < keys.length; i++)
					{
						if (json[keys[i]].accepted == false)
						{
							const MyDiv = document.createElement("div");
							MyDiv.className = "friend";
							let friendId = json[keys[i]].receiver;

							if (document.querySelector(`#friend${friendId}`))
								continue ;

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
								pdp.className = "pdp-add-friend";
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
									MyDiv.id = `friend${friendId}`;
									name.innerText = `${json.displayName}`;
									MyDiv.appendChild(name);
									MyDiv.appendChild(pdp);
									friendList.appendChild(MyDiv);
								})
							});
						}
					}
				}
			}).catch(err =>
			{
				return ;
			})
		}

		async function DisplayPendingFriends()
		{
			const header = {"Content-Type": "application/json; charset=UTF-8",}
			fetch(`https://${location.hostname}:4646/get_requests/`,
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
				if (json.length != 0)
				{
					const pending = document.querySelector("#friend-pending");

					const MyId = getCookie("user_id");
					const keys = Object.keys(json);
					for (let i = 0; i < keys.length; i++)
					{
						if (json[keys[i]].accepted == false)
						{
							const MyDiv = document.createElement("div");
							MyDiv.className = "pending";
							let friendId = json[keys[i]].receiver;
							if (json[keys[i]].receiver == MyId)
								friendId = json[keys[i]].sender;
							MyDiv.id = `friend${friendId}`;

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
								pdp.className = "pdp-add-friend";
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
								}).then(info =>
								{
									name.innerText = `${info.displayName}`;
									MyDiv.appendChild(name);
									MyDiv.appendChild(pdp);
									const buttonA = document.createElement("button");
									buttonA.id = "accept";
									buttonA.name = json[keys[i]].sender;
									buttonA.innerText = Accept_request_button;
									buttonA.className = "accept";

									const buttonR = document.createElement("button");
									buttonR.id = "reject";
									buttonR.name = json[keys[i]].sender;
									buttonR.innerText = Decline_request_button;
									buttonR.className = "reject";
									MyDiv.appendChild(buttonR);
									MyDiv.appendChild(buttonA);
									pending.appendChild(MyDiv);
									acceptFriends(buttonA, buttonR);
								})
							});
						}
					}
				}
			}).catch(err =>
			{
				return ;
			})
		}

		function acceptFriends(acceptB, rejectB)
		{
			acceptB.addEventListener("click", e =>
			{
				e.preventDefault();
				fetch(`https://${location.hostname}:4646/accept_friend/${acceptB.name}/`,
					{
						method: "POST",
						headers: {"Content-Type": "application/json; charset=UTF-8",},
						body: null,
						credentials: "include"
					}).then(res =>
				{
					document.querySelector(`#friend${acceptB.name}`).remove();
				})
			});
			rejectB.addEventListener("click", e =>
			{
				e.preventDefault();
				fetch(`https://${location.hostname}:4646/refuse_friend/${acceptB.name}/`,
					{
						method: "POST",
						headers: {"Content-Type": "application/json; charset=UTF-8",},
						body: null,
						credentials: "include"
					}).then(res =>
				{
					document.querySelector(`#friend${rejectB.name}`).remove();
				})
			});
		}

	}
}