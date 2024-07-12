export default class Access extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML = `<h1>Access</h1>`;
    }
}
