export default class Link extends HTMLElement {
    static observedAttributes = ["route"];

    constructor() {
        super();
    }

    connectedCallback() {
        this.route = window.location.pathname;
        if (this.hasAttribute('route')) {
            this.route = this.attributes["route"].value;
        }
        this.addEventListener('click', (e) => {
            console.log(`go to ${this.route}`);
            window.dispatchEvent(new CustomEvent("change-route", {detail: this.route, bubbles: true}));
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "route") {
            console.log(`new route ${newValue}`);
            this.route = newValue;
        }
    }
}
