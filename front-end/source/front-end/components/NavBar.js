import changeRoute from "../utils/changeRoute.js";
import deleteAllCookies from "../utils/deleteAllCookies.js";
import getCookie from "../utils/getCookie";
import {lang} from "../utils/getAllLang";

export default class NavBar extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		let Dashboard_button = lang.user_menu.Dashboard_button[getCookie("lang")];
		let Settings_button = lang.user_menu.Settings_button[getCookie("lang")];
		let Logout_button = lang.user_menu.Logout_button[getCookie("lang")];
		let Logout_all_button = lang.user_menu.Logout_all_button[getCookie("lang")];
		this.innerHTML = `
		<link rel="stylesheet" href="/styles/navBar.css" >
			<nav id="navbar-header">
					<div id="header-container">
						<link-route route="/home" id="title-header">OUR TRANSCENDENCE</link-route>
					</div>
					<div class="left-side">
						<div id="profile">
							<p id="profile-name">
								username
							</p>
							<img id="profile-img" src="" alt="">
						</div>
					</div>
				</nav>
				<div id="menu">
					<p id="header-dasboard">${Dashboard_button}</p>
					<p id="header-settings">${Settings_button}</p>
					<p id="logout_header">${Logout_button}</p>
					<p id="logout_all_devices">${Logout_all_button}</p>
				</div>
		`

		const MyId = getCookie('user_id');
		if (MyId == null){
			return ;
		}

		Logout();
		menu();
		GetInfos(MyId);
		GetPDP();

		const displayName = this.querySelector("#profile-name");
		const picture = this.querySelector("#profile-img");
		const profile = this.querySelector("#profile");
		const home = this.querySelector("#header-dasboard");

		home.addEventListener("click", e =>
		{
			e.preventDefault();
			changeRoute('/home');
		});

		profile.style.display = "none";
		if (window.sessionStorage.getItem("user_infos")) {
			const infos = JSON.parse(window.sessionStorage.getItem("user_infos"));
			profile.style.display = "flex";
			displayName.innerText = infos.displayName;
		}

		window.addEventListener('storage', (e) => {
			if (window.sessionStorage.getItem("user_infos")) {
				const infos = JSON.parse(window.sessionStorage.getItem("user_infos"));
				profile.style.display = "flex";
				displayName.innerText = infos.displayName;
				picture.src = `https://${location.hostname}:4646/${infos["id"]}/picture/?t=${new Date().getTime()}`;
			}
		});

		function Logout() {
			const login = document.querySelector("#logout_header");
			const LogoutAllDevices = document.querySelector("#logout_all_devices");

			const header = {
				"Content-Type": "application/json; charset=UTF-8",
			};
			login.addEventListener("click", () => {
				fetch(`https://${location.hostname}:4444/logout/`, {
					method: "POST",
					credentials: "include",
					body: null,
					headers: header,
				})
					.then((res) => {
						if (res.status == 200)
						{
							const actual_lang = getCookie('lang');
							deleteAllCookies();
							document.cookie = `lang=${actual_lang}`;
							location.reload();
						}
					})
					.catch((err) => {
						err = null;
					});
			});

			LogoutAllDevices.addEventListener("click", () => {
				fetch(`https://${location.hostname}:4444/logout_all/`, {
					method: "POST",
					credentials: "include",
					body: null,
					headers: header,
				})
					.then((res) => {
						if (res.status == 200)
						{
							deleteAllCookies();
							changeRoute('/login');
						}
					})
					.catch((err) => {
						err = null;
					});
			});
		}

		function menu()
		{
			const profile = document.querySelector("#profile");
			const settings = document.querySelector("#header-settings");
			const menuELM = document.querySelector("#menu");



			profile.addEventListener("click", (e) => {
				e.preventDefault();
				if (menuELM.style.display == "none")
					menuELM.style.display = "block";
				else
					menuELM.style.display = "none";
			});
			settings.addEventListener('click', e =>
			{
				changeRoute('/settings');
			});

			window.addEventListener('click', (e) => {
				if (e.target === menu || profile.contains(e.target))
					return;
				menuELM.style.display = "none";
			})
		}

		function GetInfos(id)
		{
			if (!id)
				return ;
			const header = {
				"Content-Type": "application/json; charset=UTF-8",
			};
			fetch(`https://${location.hostname}:4646/${id}/infos/`, {
				method: "GET",
				credentials: "include",
				body: null,
				headers: header,
			})
				.then((res) => {
					return res.json();
				})
				.then((json) => {
					const name = document.querySelector("#profile-name");
					name.innerText = json.displayName;
					document.cookie = `login=${json.login}`;
					document.cookie = `displayName=${json.displayName}`;
				})
				.catch((err) => {
					return ;
				});
		}

		function GetPDP() {
			const header = {
				"Content-Type": "image/png",
			};
			fetch(`https://${location.hostname}:4646/${getCookie("user_id")}/picture/`, {
				method: "GET",
				headers: header,
				body: null,
			})
				.then((res) => {
					return res.blob();
				})
				.then((blob) => {
					const url = URL.createObjectURL(blob);
					const img = document.querySelector("#profile-img");
					img.src = url;
					img.height = "50";
					img.width = "50";
					img.style = "margin-right: 5%; border-radius: 40px;";

					const container = document.querySelector("#header-container");
				})
				.catch((err) => {
					return ;
				});
		}
	}
}
