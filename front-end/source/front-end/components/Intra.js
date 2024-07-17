import getCookie from "../utils/getCookie";
import Login from "./Login";
import changeRoute from "/utils/changeRoute";
import createSocket from "../utils/socket";
import {lang} from "../utils/getAllLang";

export default class Intra extends HTMLElement {
    constructor() {
        super();
    }

    async connectedCallback() {

        let back_to_login = await lang.login_42.back_to_login[getCookie("lang")];
        let error = await lang.login_42.error[getCookie("lang")];
        this.innerHTML = `
        <link rel="stylesheet" href="/styles/home.css" >
        <h1>42 AUTH</h1>

        <button id="friendButtons" style="display: none"><link-route route="/login">${back_to_login}</link-route> </button>
    `;
        const urlParams = new URLSearchParams(window.location.search);
        const api_response = urlParams.get('error');
        const ft_code = urlParams.get('code');

        if (api_response != null) {
            const err = document.createElement("h1");
            err.innerHTML = error;
            document.cookie="intra=fail_login_not_link";
            this.appendChild(err);
            setTimeout(function() {
                const headers = {
                    'Content-Type': 'application/json; charset=UTF-8'
                };
                fetch(`https://${location.hostname}:4444/refresh/`, {
                    method: 'GET',
                    credentials: 'include',
                    headers: headers,
                    body: null
                })
                    .then(async res => {
                        if (!res.ok)
                            changeRoute("/login");
                        else
                        {
                            if (this.isSock === 0)
                            {
                                this.socket = await createSocket()
                                this.isSock = 1;
                            }
                            changeRoute('/settings');
                        }
                    })
                    .catch(err => {
                        this.isSock = 0;
                        if (this.refreshInterval)
                            clearInterval(this.refreshInterval);
                        changeRoute("/login");
                    });
            }, 5000);
        }
        else {
            fetch(`https://${location.hostname}:4444/token_42/`, {
                    method: "POST",
                    credentials: "include",
                    headers: {},
                    body: JSON.stringify({
                        "code": ft_code
                    })
            }) .then((res) => {
                if (res.status === 200)
                {
                    //check cookie "42_action"
                    const action = getCookie('42_action');
                    document.cookie = "42_action=done";
                    switch (action) {
                        case "login":
                            this.intra_login();
                            createSocket();
                            break;
                        case "link":
                            this.intra_link();
                            break;
                        case "unlink":
                            this.intra_unlink();
                            break;
                        default:
                            break;
                    }
                }
            }).catch(err => {
            });
        }
    }

     intra_login() {
        document.cookie = "42_action=done";
        fetch(`https://${location.hostname}:4444/login_42/`, {
            method: "GET",
            credentials: "include",
            headers: {},
            body: null
        }).then(res => {
            if (res.status !== 200)
            {
                
            }
            if (res.status === 200) {
                this.dispatchEvent(new CustomEvent("update-infos", {bubbles: true}));
                changeRoute("/home");
            }
        }).catch(err => {
            return ;
        });
    }

    intra_link() {
        document.cookie = "42_action=done";
        fetch(`https://${location.hostname}:4444/link_42/`, {
            method: "POST",
            credentials: "include",
            headers: {},
            body: null
        }).then(res => {
            if (res.status === 204) {
                changeRoute("/settings");
            } else {
                changeRoute("/settings");
            }
        }).catch(err => {
            changeRoute("/home");
        });
    }

    intra_unlink() {
        document.cookie = "42_action=done";
        fetch(`https://${location.hostname}:4444/unlink_42/`, {
            method: "POST",
            credentials: "include",
            headers: {},
            body: null
        }).then(res => {
            if (res.status === 204) {
                changeRoute("/settings");
            } else {
                changeRoute("/settings");
            }
        }).catch(err => {
            changeRoute("/home");
        });
    }
}
