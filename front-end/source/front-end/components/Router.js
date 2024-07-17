import updateInfos from "/utils/updateInfos.js";
import changeRoute from "/utils/changeRoute.js";
import getCookie from "../utils/getCookie";
import createSocket from "../utils/socket";
import socket from "../utils/socket";

export default class Router extends HTMLElement {
	constructor() {
		super();
		this.socket;
		this.isSock = 0;
		this.routes = {
			"/404":
				{
					elem: "error-page",
					regex: false,
					header: false
				},
			"/login": {
				elem: "login-page",
				regex: false,
				header: false
			},
			"/register": {
				elem: "register-page",
				regex: false,
				header: false
			},
			"/home": {
				elem: "home-page",
				regex: false,
				header: true
			},
			"/settings": {
				elem: "settings-page",
				regex: false,
				header: true
			},
			"/stats": {
				elem: "stats-page",
				regex: false,
				header: true,
			},
			"/friends": {
				elem: "friends-page",
				regex: false,
				header: true
			},
			"\\/\\d+\\/infos": {
				elem: "infos-page",
				regex: true,
				header: true
			},
			"/intra": {
				elem: "intra-page",
				regex: false,
				header: false
			},
			"/pong/local/form": {
				elem: "local-pong-form",
				regex: false,
				header: true
			},
			"/pong/modeSelector": {
					elem: "pong-selector",
					regex: false,
					header: true
			},
			"/gunfight/modeSelector": {
				elem: "gunfight-selector",
				regex: false,
				header: true
			},
			"/pong/local/game": {
				elem: "local-pong-game",
				regex: false,
				header: false
			},
			"/pong/local/tournament": {
				elem: "local-pong-tournament",
				regex: false,
				header: false
			},
			"/pong/remote/matchmaking": {
				elem: "pong-matchmaking",
				regex: false,
				header: true
			},
			"/pong/remote/game": {
				elem: "remote-pong-game",
				regex: false,
				header: false
			},
			"/gunfight/local/tournament":
				{
					elem: "local-gunfight-tournament",
					regex: false,
					header: true
				},
			"/gunfight/local/form": {
				elem: "local-gunfight-form",
				regex: false,
				header: true
			},
			"/gunfight/local/game": {
				elem: "local-gunfight-game",
				regex: false,
				header: false
			},
			"/gunfight/remote/matchmaking": {
				elem: "gunfight-matchmaking",
				regex: false,
				header: true
			},
			"/gunfight/remote/game": {
				elem: "remote-gunfight-game",
				regex: false,
				header: false
			},
			"/pong/commands": {
				elem: "pong-commands",
				regex: false,
				header: true
			},
			"/gunfight/commands": {
				elem: "gunfight-commands",
				regex: false,
				header: true
			},
    };
    this.refreshInterval = undefined;
  }
	connectedCallback()
	{
		this.runRefresh();
		window.addEventListener("change-route", (e) => {
			if (e.detail === location.pathname)
				return;
			if (e.detail !== "/") {
				window.history.pushState(null, null, e.detail);
			}
			this.rend();
		});
		window.addEventListener("popstate", () => {
			this.rend();
		});
		this.addEventListener("update-infos", () => {
			this.runRefresh();
		});
		this.rend();
	}

	rend() {
		document.querySelector('html').lang = getCookie('lang');
		if (location.pathname === "/") {
			const urlParams = new URLSearchParams(window.location.search);
			const ft_code = urlParams.get('code');
			changeRoute("/home");

      const headers = {
        "Content-Type": "application/json; charset=UTF-8",
      };

      if (ft_code) {
        const headers = {};

        fetch(`https://${location.hostname}:4444/token_42/`, {
          method: "POST",
          credentials: "include",
          headers: headers,
          body: JSON.stringify({
            code: ft_code,
          }),
        }).then((res) => {
          if (res.ok) {
            const headers = {};
            fetch(`https://${location.hostname}:4444/login_42/`, {
              method: "GET",
              credentials: "include",
              body: null,
              headers: headers,
            }).then((res) => {
              if (res.ok) {
                this.dispatchEvent(
                  new CustomEvent("update-infos", { bubbles: true })
                );
                changeRoute("/home");
              }
            });
          }
        });
      } else {
        fetch(`https://${location.hostname}:4444/refresh/`, {
          method: "GET",
          credentials: "include",
          headers: headers,
          body: null,
        })
          .then((res) => {
            if (
              !res.ok &&
              location.pathname !== "/login" &&
              location.pathname !== "/register"
            )
              changeRoute("/login");
          })
          .catch(() => changeRoute("/login"));
      }
    } else {
      this.updateContent(location.pathname);
    }
  }

	updateContent(locationToRend)
	{
		if (!getCookie('lang'))
			document.cookie = "lang=en";
		this.innerHTML = "";
		for (let route in this.routes) {
			if (locationToRend === route && !this.routes[route].regex)
			{
				const elem = document.createElement(this.routes[route].elem);
				this.appendChild(elem);
				if (this.routes[route].header)
				{
					const	header = document.querySelector("#header");
					if (document.querySelector('nav-bar') == null)
					{
						const headerElm = document.createElement("nav-bar");
						header.appendChild(headerElm);
					}
				}
				else
				{
					const headerElm = document.querySelector("nav-bar");
					if (headerElm)
						headerElm.remove();
				}
				return;
			}
			if (locationToRend.match(route) && this.routes[route].regex)
			{
				const elem = document.createElement(this.routes[route].elem);
				this.appendChild(elem);
				if (this.routes[route].header)
				{
					const	header = document.querySelector("#header");
					if (document.querySelector('nav-bar') == null)
					{
						const headerElm = document.createElement("nav-bar");
						header.appendChild(headerElm);
					}
				}
				else
				{
					const headerElm = document.querySelector("nav-bar");
					if (headerElm)
						headerElm.remove();
				}
				return;
			}
		}
		changeRoute("/404");
	}

	runRefresh() {
		updateInfos();
		if (this.refreshInterval)
			clearInterval(this.refreshInterval);
		this.refresh();
		this.refreshInterval = setInterval(() => {
			this.refresh();
		}, 540000);
	}
	async refresh()
	{
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
				{
					if (this.refreshInterval)
						clearInterval(this.refreshInterval);
					this.isSock = 0;
					changeRoute("/login");
				}
				else
				{
					if (this.isSock === 0)
					{
						this.socket = await createSocket()
						this.isSock = 1;
					}
				}
			})
			.catch(err => {
				this.isSock = 0;
				if (this.refreshInterval)
					clearInterval(this.refreshInterval);
				changeRoute("/login");
			});
	}
}
