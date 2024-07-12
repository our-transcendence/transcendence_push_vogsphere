import getCookie from "./getCookie";

export default function updateInfos() {
    const user_id = getCookie('user_id');

    if (user_id === null)
        return ;
    const header = {
        'Content-Type': 'application/json; charset=UTF-8',
    };
    fetch(`https://${location.hostname}:4646/${user_id}/infos/`, {
        method: "GET",
        credentials: "include",
        body: null,
        headers: header
    })
        .then(res =>  res.text())
        .then(text => {
            window.sessionStorage.setItem("user_infos", text);
            window.dispatchEvent(new Event('storage'));
        })
}