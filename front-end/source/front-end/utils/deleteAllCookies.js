export default function deleteAllCookies() {
    let allCookies = document.cookie.split(';');

    for (let i = 0; i < allCookies.length; i++)
    {
        document.cookie = allCookies[i] + "=;expires=" + new Date(0).toUTCString();
    }
}
