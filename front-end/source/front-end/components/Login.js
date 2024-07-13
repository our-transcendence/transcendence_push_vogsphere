import changeRoute from "../utils/changeRoute.js";
import getCookie from '/utils/getCookie'
import {lang} from "../utils/getAllLang";

export default class Login extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback() {

		let title = await lang.login_page.title[getCookie("lang")];
		let login_field = await lang.login_page.login_field[getCookie("lang")];
		let password_field = await lang.login_page.password_field[getCookie("lang")];
		let login_button = await lang.login_page.login_button[getCookie("lang")];
		let button_42 = await lang.login_page["42_button"][getCookie("lang")];
		let Register_instead_button = await lang.login_page.Register_instead_button[getCookie("lang")];
		let invalid_credentials = await lang.login_page.invalid_credentials[getCookie("lang")];
		let error_user_service = await lang.login_page.error_user_service[getCookie("lang")];
		let invalid_otp = await lang.login_page.invalid_otp[getCookie("lang")];
		let complete_fields = await lang.login_page.complete_fields[getCookie("lang")];

		this.innerHTML = `
        <link rel="stylesheet" href="/styles/login.css">

        <div id="Login-Element">
            <h1 id="title">OUR TRANSCENDENCE</h1>
            <h2 id="form-title">${title}</h2>

            <div>
                <form id="login-form" class="form">
                    <div>
                        <label for="Login" id="login-label" class="form-label">${login_field}</label>
                        <div>
                            <input type="text" id="Login" class="form-input">
                        </div>
                    </div>
                    <label for="Password" id="password-label" class="form-label">${password_field}</label>
                    <div id="form-password">
                        <input type="password" id="Password" class="form-input">
                        <button type="button" id="togglePassword">
                        <img src="/imgs/viewOff.svg" alt="" id="img_see" height="24px" width="24px">
                        </button>
                    </div>

                    <div id="button-div">
                        <button type="submit" id="submit-login" class="submit-button">${login_button}</button>
                        <button type="button" id="APILogin">${button_42}</button>
                    </div>
                    <p id="message"></p>
                    <div id="red-line"></div>
                    <link-route route="/register" id="change-register-login">${Register_instead_button}</link-route>
                </form>
                <div style="background-color: darkgrey;" id="otp-input-container" class="background">
                	<otp-input></otp-input>
                	<button id=""></button>
                </div>
            </div>
        </div>
        `
		const form = this.querySelector('#login-form');
		const login = this.querySelector("#Login");
		const pass = this.querySelector("#Password");
		const pass_toggle = this.querySelector("#togglePassword");
		const submitButton = this.querySelector("#submit-login");
		const ftAuth = this.querySelector("#APILogin");
		const otpInputContainer = this.querySelector("#otp-input-container");
		const otpInput = this.querySelector("otp-input");
		const message = this.querySelector("#message");

		const closeSocket = new Event('socket-close',
			{
				bubbles: true,
				detail: { message: "close" }
			});
		window.dispatchEvent(closeSocket);

		pass_toggle.addEventListener("click", (e) => {
			e.preventDefault();

			if (pass.type === "password")
				pass.type = "text";
			else
				pass.type = "password";
		});

		form.addEventListener("submit", (e) => {
			e.preventDefault();

			const login_value = login.value;
			const pass_value = pass.value;

			if (login_value.trim() === '' || pass_value.trim() === '') {
				message.innerText = complete_fields;
				message.style.color = "#C82611";
				message.style.fontSize = '24px';
				message.style.marginTop = "10px";
				message.style.marginLeft = "20px";
				message.style.maxWidth = "300px";
				return ;
			}

			const headers =  {
				Authorization: 'Basic ' + btoa(`${login_value}:${pass_value}`)
			};

			submitButton.disabled = true;
			fetch(`https://${location.hostname}:4444/login/`, {
				method: 'GET',
				credentials: 'include',
				headers: headers,
				body: null
			}).then(res => {
				if (res.status === 200)
				{
					this.dispatchEvent(new CustomEvent("update-infos", {bubbles: true}));
					changeRoute("/home");
				}
				else if (res.status === 202)
				{
					form.style.display = 'none';
					otpInput.reset();
					otpInputContainer.style.display = "flex";
				}
				else if (res.status == 408)
				{
					message.innerText = error_user_service;
					message.style.color = "#C82611";
					message.style.fontSize = '24px';
					message.style.marginTop = "10px";
					message.style.marginLeft = "20px";
					message.style.maxWidth = "300px";
				}
				else
				{
					message.innerText = invalid_credentials;
					message.style.color = "#C82611";
					message.style.fontSize = '24px';
					message.style.marginTop = "10px";
					message.style.marginLeft = "20px";
					message.style.maxWidth = "300px";
				}
				submitButton.disabled = false;
			}).catch(err => {
				submitButton.disabled = false;
			})
		});

		ftAuth.addEventListener("click", (e) => {
			const headers = {
				'Content-Type': 'application/json'
			}

			document.cookie = "42_action=login";
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

		otpInputContainer.addEventListener("otp-code", (e) => {
			const header = {
				'Content-Type': 'application/json; charset=UTF-8',
			}
			const body = JSON.stringify({"otp_code" : e.detail})
			fetch(`https://${location.hostname}:4444/otp/`, {
				method: "POST",
				credentials: "include",
				body: body,
				headers: header,
			})
				.then((res) => {
					if (res.ok)
					{
						this.dispatchEvent(new CustomEvent("update-infos", {bubbles: true}));
						changeRoute("/home");
					}
					else
					{
						form.style.display = "block";
						otpInputContainer.style.display = "none";
						message.innerText = invalid_otp;
						message.style.color = "#C82611";
						message.style.fontSize = '24px';
						message.style.marginTop = "10px";
						message.style.marginLeft = "20px";
						message.style.maxWidth = "300px";
					}
				});
		})
	}
}
