import LocalPongComponent from "/all-games-fronts/game-srcs/LocalPongComponent.js";
import RemotePongComponent from "/all-games-fronts/game-srcs/RemotePongComponent.js";
import LocalGunFightComponent from "/all-games-fronts/game-srcs/LocalGunFightComponent.js";
import RemoteGunfightComponent from "./game-srcs/RemoteGunfightComponent";

window.customElements.define("local-pong", LocalPongComponent);
window.customElements.define("remote-pong", RemotePongComponent);
window.customElements.define("local-gunfight", LocalGunFightComponent);
window.customElements.define("remote-gunfight", RemoteGunfightComponent);
