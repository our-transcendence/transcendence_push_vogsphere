export default class Infos extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const user_id = parseInt(location.pathname.substring(1));
        this.innerHTML = `<h1>Infos about ${user_id}</h1>`;
    }
}
