import getCookie from "./getCookie";

export default async function createSocket()
{
	const isSocket = getCookie("socket");
	let socket = await new WebSocket(`wss://${location.hostname}:4646/ws/status/`);
	socket.onopen = (e) => {console.log(e);}
	socket.onclose = (e) => {console.log(e)};
	socket.onerror = (e) => {console.log(e);}
	socket.onmessage = (e) =>
	{
		const socketEvent = new CustomEvent('socket-message',
			{
				bubbles: true,
				detail: {message: e.data}
			});
		window.dispatchEvent(socketEvent);
		console.log(e.data);
	}

	window.addEventListener('socket-close', e=>
	{
		console.log("close");
		if (socket.readyState === WebSocket.OPEN)
			socket.close();
	})

	return (socket);
}
