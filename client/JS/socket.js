window.auth = function auth(nick) {
	window.sock = io.connect("/chat", {
		reconnectionAttempts: 50,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 2000,
		path: "/chat",
		query: {
			nick: nick
		}
	});

	sock.once("disallow", msg => {
		alert(msg);
		location.reload();
	});
	sock.once("allow", () => console.log("Successful Login."));
	sock.once("connect", () => sock.emit("auth", nick));
	sock.on("connect_error", () => {
		alert("Could not connect. Refreshing...");
		location.reload();
	});
	sock.on("connect_timeout", () => {
		alert("Connection timed out. Refreshing...");
		location.reload();
	});
	sock.on("disconnect", () => {
		message("<font style='color: red'><b>You have been disconnected. Attempting reconnect...</font></b>", "<b>SYSTEM</b>");
		sock.open();
	});
	sock.on("reconnecting", () => message("<font style='color: red'><b>Reconnecting...</font></b>", "<b>SYSTEM</b>"));
	sock.on("reconnect", () => message("<font style='color: green'><b>Reconnected.</font></b>", "<b>SYSTEM</b>"));
	sock.once("reconnect_error", () => {
		alert("Could not reconnect. Refreshing...");
		location.reload();
	});
	sock.once("reconnect_failed", () => {
		alert("Could not reconnect. Refreshing...");
		location.reload();
	});
	sock.on("ping", () => console.log("Pinging..."));
	sock.on("pong", lat => console.log("Pong! Latency: " + lat));
} //auth

console.log("Sockets Loaded.");

window.message = () => { } //@Override
