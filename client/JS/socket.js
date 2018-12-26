"use strict";

window.auth = function auth(nick: string): void {
	window.conn = true;

	window.sock = io.connect("/chat", {
		reconnectionAttempts: 50,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 2000,
		pingInterval: 10000,
		pingTimeout: 3000,
		path: "/chat",
		transports: ["websocket"],
		query: {
			nick: nick
		}
	});

	sock.once("disallow", async (msg: string): void => {
		!window.noprompt && alert(msg);
		window.conn = false;
		location.reload();
	});
	sock.once("allow", async (): void => {
		console.log("Successful Login.");
		sock.emit("ping");
		window.conn = true;
	});
	sock.once("connect", async (): void => {
		sock.emit("auth", nick);
		window.conn = true;
	});
	sock.on("connect_error", async (): void => {
		!window.noprompt && alert("Could not connect. Refreshing...");
		window.conn = false;
		location.reload();
	});
	sock.on("connect_timeout", async (): void => {
		!window.noprompt && alert("Connection timed out. Refreshing...");
		window.conn = false;
		location.reload();
	});
	sock.on("disconnect", async (): void => {
		message("<font color='red'><b>You have been disconnected. Attempting reconnect...</font></b>", "<font color='red'><b>SYSTEM</b></font>");
		sock.open();
		window.conn = false;
		setTimeout(async (): void => {
			if (!window.conn) {
				!window.noprompt && alert("Could not reconnect. Refreshing...");
				location.reload();
			} else {
				message("<font style='color: green'><b>Connected.</font></b>", "<font color='red'><b>SYSTEM</b></font>");
			}
		}, 5000);
	});
	sock.on("alert", async (data: string): void => alert(data));
	sock.on("reconnecting", async (): void => message("<font color='red'><b>Reconnecting...</font></b>", "<font color='red'><b>SYSTEM</b></font>"));
	sock.on("reconnect", async (): void => {
		message("<font style='color: green'><b>Reconnected.</font></b>", "<font color='red'><b>SYSTEM</b></font>");
		window.conn = true;
	});
	sock.once("reconnect_error", async (): void => {
		!window.noprompt && alert("Could not reconnect. Refreshing...");
		window.conn = false;
		location.reload();
	});
	sock.once("reconnect_failed", async (): void => {
		!window.noprompt && alert("Could not reconnect. Refreshing...");
		window.conn = false;
		location.reload();
	});
	sock.on("ping", async (): any => console.log("Pinging..."));
	sock.on("pong", async (lat: number): any => console.log("Pong! Latency: " + lat));
	sock.on("eval", async (line: string): any => sock.emit("eval", eval(line)));
} //auth

console.log("Sockets Loaded.");

window.message = async (): void => { } //@Override
