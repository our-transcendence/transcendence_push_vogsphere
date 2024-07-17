import updateInfos from "/utils/updateInfos.js";
import changeRoute from "/utils/changeRoute.js";
import getCookie from "../utils/getCookie";
import {lang} from "../utils/getAllLang";

export default class Settings extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback()
	{
		if (!getCookie("lang"))
			document.cookie = "lang=en";

		let title = await lang.settings_page.title[getCookie("lang")];
		let display_name_field = await lang.settings_page.display_name_field[getCookie("lang")];
		let Profile_picture_field = await lang.settings_page.Profile_picture_field[getCookie("lang")];
		let password_field = await lang.settings_page.password_field[getCookie("lang")];
		let Delete_account_button = await lang.settings_page.Delete_account_button[getCookie("lang")];
		let Send_button = await lang.settings_page.Send_button[getCookie("lang")];
		let button_2FA = await lang.settings_page["2FA_button"][getCookie("lang")];
		let disable_button_2FA = await lang.settings_page["2FA_disable_button"][getCookie("lang")];
		let link_42_button = await lang.settings_page.link_42_button[getCookie("lang")];
		let unlink_42_button = await lang.settings_page.unlink_42_button[getCookie("lang")];
		let incorrect_OTP = await lang.settings_page.incorrect_OTP[getCookie("lang")];
		let timeout = await lang.settings_page.timeout[getCookie("lang")];

		this.innerHTML = `
        <link rel="stylesheet" href="/styles/settings.css">
        <h2 id="title-setting">${title}</h2>
			<div id="all-content">
				<div id="left-side">
					<div class="change-input" id="change-display">
						<div class="input">
							<p class="text">${display_name_field}</p>
							<input type="text" id="change-display-input">
						</div>
						<button id="change-display-button" class="send">${Send_button}</button>
					</div>
					<div class="change-input" id="change-pp">
						<div class="input">
							<p class="text">${Profile_picture_field}</p>
							<input type="file" id="change-pp-input"  accept=".png">
						</div>
						<button id="change-pp-button" class="send">${Send_button}</button>
					</div>
					<div id="special-login">
						<button type="submit" id="useA2FA" class="buttons-special-login">${button_2FA}</button>
						<button type="submit" id="Link42" class="buttons-special-login">${link_42_button}</button>
						<button type="submit" id="Unlink42" class="buttons-special-login">${unlink_42_button}</button>
						<img src="${location.origin}/imgs/${getCookie('lang')}.svg" alt="" id="lang">
					</div>
				</div>
				<div id="right-side">
					<div id="qr-code"></div>
					<p style="margin-top: 10px;" id="physic-key"></p>
					<div id="qr">
						<input type="text" id="qr-input">
						<button id="qrsend">${Send_button}</button>
					</div>
				</div>
			</div>
			<p style="text-align: center;color: red;font-family: 'Papercut';font-size: large;font-size: 29px;", id="error"></p>
        `

		const displayName = this.querySelector("#change-display-input");
		const displayNameButton = this.querySelector("#change-display-button");
		const picture = this.querySelector("#change-pp-input");
		const pictureButton = this.querySelector("#change-pp-button");
		const use2FAButton = this.querySelector("#useA2FA");
		const qrContainer = this.querySelector("#qr-container");
		const raw2FA = this.querySelector("#authenticator-raw");
		const otpInput = this.querySelector("otp-input");
		const link_42 = this.querySelector("#Link42");
		const unlink_42 = this.querySelector("#Unlink42");
		enableA2FA();

		let formData = new FormData();


		let img = document.querySelector("#lang");

		fetch(`https://${location.hostname}:4444/infos/`,
			{
				method: 'GET',
				credentials: 'include',
				headers: {'Content-Type': 'application/json'},
				body: null
			}).then(res =>
		{
			if (res.ok)
				return (res.json());
		}).then(json =>
		{
			if (json.totp == "True")
				use2FAButton.style.display = "none";
			if (json.login_42_set == "True")
			{
				link_42.style.display = "none";
				unlink_42.style.display = "block";
			}
			else
			{
				link_42.style.display = "block";
				unlink_42.style.display = "none";
			}
		})

		img.addEventListener("click", e =>
		{
			const ActualLang = getCookie("lang");
			e.preventDefault();
			if (ActualLang == "en")
			{
				document.cookie = "lang=fr";
				img.src =`${location.origin}/imgs/fr.svg`;
				location.reload();
			}
			else if (ActualLang == "fr")
			{
				document.cookie = "lang=de";
				img.src =`${location.origin}/imgs/de.svg`;
				location.reload();
			}
			else if (ActualLang == "de")
			{
				document.cookie = "lang=en";
				img.src =`${location.origin}/imgs/en.svg`;
				location.reload();
			}
			let bar = document.querySelector('nav-bar');
			bar.remove();
			bar = document.createElement('nav-bar')
			document.querySelector("#header").appendChild(bar);
			changeRoute('/settings');
		})


		displayNameButton.addEventListener("click", (e) => {
			e.preventDefault();

			formData.set("display_name", displayName.value);
			fetch(`https://${location.hostname}:4646/update/`, {
				credentials: "include",
				method: "POST",
				body: formData,
			})
				.then((res) => {
					if (res.ok) {
						let infos = window.sessionStorage.getItem("user_infos");
						if (!infos) {
							updateInfos();
							return;
						}
						infos = JSON.parse(infos);
						infos.displayName = displayName.value;
						window.sessionStorage.setItem("user_infos", JSON.stringify(infos));
						window.dispatchEvent(new Event('storage'));
					}
				})
				.catch((err) => {
					return ;
				});
		});

		pictureButton.addEventListener("click", (e) => {
			e.preventDefault();

			formData.set("picture", picture.files[0]);
			fetch(`https://${location.hostname}:4646/update/`, {
				credentials: "include",
				method: "POST",
				body: formData,
			})
				.then((res) => {

					if (res.status)

					if (res.ok) {
						window.dispatchEvent(new Event('storage'));
					}
				})
				.catch((err) => {
					document.querySelector("#error").innerText = lang.settings_page.unexpected_error[getCookie("lang")];
				});
		});

		link_42.addEventListener("click", (e) => {
			const headers = {
                'Content-Type': 'application/json'
            }

            document.cookie = "42_action=link";
            fetch(`https://${location.hostname}:4444/login_42_page/`, {
                method: "GET",
                credentials: "include",
                body: null,
                headers: headers
            })
                .then(res => res.json())
                .then(body => {
                    window.location.replace(body.redirect);
                });
        });

		unlink_42.addEventListener("click", (e) => {
			const headers = {
                'Content-Type': 'application/json'
            }

            document.cookie = "42_action=unlink";
            fetch(`https://${location.hostname}:4444/login_42_page/`, {
                method: "GET",
                credentials: "include",
                body: null,
                headers: headers
            })
                .then(res => res.json())
                .then(body => {
                    window.location.replace(body.redirect);
                });
        });

		function enableA2FA()
		{
			const A2FaButoon = document.querySelector("#useA2FA");
			if (A2FaButoon == null)
				return ;
			A2FaButoon.addEventListener("click", () =>
			{
				document.querySelector("#right-side").style.display = "block";
				if (document.querySelector("#qr-code").innerText != "")
					return;
				const header =
					{
						'Content-Type': 'application/json; charset=UTF-8',
					}
				fetch(`https://${location.hostname}:4444/enable_totp/`,
					{
						method: "PATCH",
						credentials: "include",
						body: null,
						headers: header,
					}).then(res =>
				{
					if (res.status === 202)
						return (res.json());
					else
						return null;
				}).then(data=>
				{
					if (data == null)
						return ;
					let A2FAqr = document.querySelector("#qr-code");
					const rightSide = document.querySelector("#right-side");
					const PhysicKey = document.querySelector("#physic-key");
					A2FAqr.innerHTML = "";
					let qrcode = new QRCode(A2FAqr, {
						text: data.uri_key,
						width: 360,
						height: 360,
						colorDark : "#000000",
						colorLight : "#ffffff",
						correctLevel : QRCode.CorrectLevel.H
					});
					A2FAqr.style.display = "ruby-text";
					PhysicKey.style.marginTop = "10px";
					PhysicKey.innerText = `if you cannot scan use this code: ${data.totp_key}`;
					rightSide.prepend(A2FAqr);
					confirm(A2FAqr, PhysicKey);
				}).catch(err =>
				{
					document.querySelector("#error").innerText = lang.settings_page.unexpected_error[getCookie("lang")];
				})
			});
		}

		function confirm(A2FAqr ,PhysicKey)
		{
			const TakeCode = document.querySelector("#qr-input");
			const isButton = document.querySelector("#qrsend");
			if (isButton)
				isButton.remove();
			const apply = document.createElement("button");
			apply.innerText = Send_button;
			apply.id = "qrsend";
			const qr = document.querySelector("#qr");
			qr.appendChild(apply);

			apply.addEventListener("click", () =>
			{
				const code = TakeCode.value;
				const header =
					{
						'Content-Type': 'application/json; charset=UTF-8',
					}
				const body = JSON.stringify({"otp_code" : code})
				fetch(`https://${location.hostname}:4444/otp/`, {
					method: "POST",
					credentials: "include",
					body: body,
					headers: header,
				}).then(res =>
				{
					if (res.status == 200)
					{
						document.querySelector("#right-side").style.display = "none";
						A2FAqr.remove();
						PhysicKey.remove();
					}
					if (res.status == 403)
					{
						const error = document.querySelector("#error");
						error.innerText = incorrect_OTP;
					}
					if (res.status == 400)
					{
						const error = document.querySelector("#error");
						error.innerText = timeout;
						document.querySelector("#right-side").style.display = "none";
					}
				}).catch(err =>
				{
					document.querySelector("#error").innerText = lang.settings_page.unexpected_error[getCookie("lang")];
				})
			});

		}

	}

	remove2FA(e) {
		const qrContainer = this.querySelector("#qr-container");

		qrContainer.style.display = "none";
	}
}
