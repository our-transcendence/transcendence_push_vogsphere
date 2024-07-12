import {lang} from "../utils/getAllLang";
import getCookie from "../utils/getCookie";

export default class OtpInput extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {
        let submit = await lang.otp_input.submit[getCookie("lang")];
        this.innerHTML = `
        <link rel="stylesheet" href="/styles/otpInput.css">
        <div style="background-color: darkgrey;" id="otp-container" class="background">
            <div id="inputs" class="inputs">
                <input id="otp-code" type="text" maxlength="6" placeholder="0000000"/>
            </div>
            <button id="confirm" type="submit">${submit}</button>
        </div>
        `

        const confirmButton = this.querySelector("#confirm");
        const codeInput = this.querySelector("#otp-code");

        confirmButton.addEventListener("click", function (e) {
            e.preventDefault();

            this.dispatchEvent(new CustomEvent("otp-code", {
                detail: codeInput.value,
                bubbles: true
            }));
        })
    }

    reset() {
        const codeInput = this.querySelector("#otp-code");

        codeInput.value = "";
    }
}
