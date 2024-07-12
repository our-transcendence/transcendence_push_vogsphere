import getCookie from "./getCookie";

export default async function createSocket()
{
	const isSocket = getCookie("socket");
	let socket = await new WebSocket(`wss://${location.hostname}:4646/ws/status/`);
	socket.onopen = (e) => {}
	socket.onclose = (e) => {};
	socket.onerror = (e) => {}
	socket.onmessage = (e) =>
	{
		const socketEvent = new CustomEvent('socket-message',
			{
				bubbles: true,
				detail: {message: e.data}
			});
		window.dispatchEvent(socketEvent);
	}

	window.addEventListener('socket-close', e=>
	{
		if (socket.readyState === WebSocket.OPEN)
			socket.close();
	})

	return (socket);
}
