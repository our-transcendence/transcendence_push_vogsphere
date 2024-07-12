export default function changeRoute(route) {
    window.dispatchEvent(new CustomEvent("change-route", {detail: route, bubbles: true}));
}