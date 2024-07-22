import changeRoute from "../utils/changeRoute.js";
import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class Register extends HTMLElement {
	constructor() {
		super();
	}

	async connectedCallback() {

		if (!getCookie("lang"))
			document.cookie = "lang=en";

		let title = await lang.register_page.title[getCookie("lang")];
		let login_field = await lang.register_page.login_field[getCookie("lang")];
		let password_field = await lang.register_page.password_field[getCookie("lang")];
		let register_button = await lang.register_page.register_button[getCookie("lang")];
		let Login_instead_button = await lang.register_page.Login_instead_button[getCookie("lang")];
		let error_user_service = await lang.register_page.error_user_service[getCookie("lang")];
		let complete_fields = await lang.register_page.complete_fields[getCookie("lang")];
		let already_exist = await lang.register_page.already_exist[getCookie("lang")];
		let password_too_short = await lang.register_page.password_too_short[getCookie("lang")];
		let unexpected_error = await lang.register_page.unexpected_error[getCookie("lang")];
		let invalid_char = await lang.register_page.invalid_char[getCookie("lang")];

		this.innerHTML = `
        <link rel="stylesheet" href="/styles/register.css">

        <div id="Register-Element">

        <h1 id="title">OUR TRANSCENDENCE</h1>
        <h2 id="form-title">${title}</h2>

            <div>
                <form id="register-form" class="form">
                    <div class="">
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
                        <button type="submit" id="submit-register" class="submit-button">${register_button}</button>
                    </div>
            		<p id="message"></p>
                    <div id="red-line"></div>
                    <link-route route="/login" id="change-register-login">${Login_instead_button}</link-route>
                </form>
            </div>
        </div>
        `
		const form = this.querySelector('#register-form');
		const login = this.querySelector("#Login");
		const pass = this.querySelector("#Password");
		const pass_toggle = this.querySelector("#togglePassword");
		const submitButton = this.querySelector("#submit-register");
		const message = document.getElementById('message');

		pass_toggle.addEventListener("click", (e) => {
			e.preventDefault();

			if (pass.type === "password")
				pass.type = "text";
			else
				pass.type = "password";
		});

		function onlyAlphanumeric(str) {
			return /^[a-zA-Z0-9_-]{5,15}$/.test(str);
		}

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
			if (!onlyAlphanumeric(login_value) || !onlyAlphanumeric(pass_value))
			{
				message.innerText = invalid_char;
				message.style.color = "#C82611";
				message.style.fontSize = '24px';
				message.style.marginTop = "10px";
				message.style.marginLeft = "20px";
				message.style.maxWidth = "300px";
				return ;
			}

			const headers = {
				'Content-Type': 'text/plain',
			};
			const body =  JSON.stringify({
				login: login_value,
				password: pass_value,
				display_name: login_value,
			});

			submitButton.disabled = true;
			fetch(`https://${location.hostname}:4444/register/`, {
				method: 'POST',
				credentials: 'include',
				headers: headers,
				body: body
			}).then(res => {
				if (res.status === 200) {
					this.dispatchEvent(new CustomEvent("update-infos", {bubbles: true}));
					changeRoute("/home");
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
				else if (res.status == 400)
				{
					message.innerText = password_too_short;
					message.style.color = "#C82611";
					message.style.fontSize = '24px';
					message.style.marginTop = "10px";
					message.style.marginLeft = "20px";
					message.style.maxWidth = "300px";
				}
				else
				{
					message.innerText = already_exist;
					message.style.color = "#C82611";
					message.style.fontSize = '24px';
					message.style.marginTop = "10px";
					message.style.marginLeft = "20px";
					message.style.maxWidth = "300px";
				}
				submitButton.disabled = false;
			}).catch(err => {
				message.innerText = unexpected_error;
				message.style.color = "#C82611";
				message.style.fontSize = '24px';
				message.style.marginTop = "10px";
				message.style.marginLeft = "20px";
				message.style.maxWidth = "300px";
				submitButton.disabled = false;
			})
		});
	}
}
