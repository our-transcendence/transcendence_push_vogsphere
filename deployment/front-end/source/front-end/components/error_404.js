export default class CustomErrorPage extends HTMLElement {
	constructor() {
		super();
	}

	connectedCallback() {
		this.innerHTML = `<link-route route="/home"><img src="/imgs/not_found.jpg" alt="404" style="width: 100%; height: 100%;"></link-route>`;
	}
}
