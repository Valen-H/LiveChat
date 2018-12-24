window.auth = function auth(nick) {
	let conn = true;

	window.sock = io.connect("/chat", {
		reconnectionAttempts: 50,
		reconnectionDelay: 1000,
		reconnectionDelayMax: 2000,
		pingInterval: 10000,
		pingTimeout: 3000,
		path: "/chat",
		query: {
			nick: nick
		}
	});

	sock.once("disallow", msg => {
		alert(msg);
		conn = false;
		location.reload();
	});
	sock.once("allow", () => {
		console.log("Successful Login.");
		sock.emit("ping");
		conn = true;
	});
	sock.once("connect", () => {
		sock.emit("auth", nick);
		conn = true;
	});
	sock.on("connect_error", () => {
		alert("Could not connect. Refreshing...");
		conn = false;
		location.reload();
	});
	sock.on("connect_timeout", () => {
		alert("Connection timed out. Refreshing...");
		conn = false;
		location.reload();
	});
	sock.on("disconnect", () => {
		message("<font style='color: red'><b>You have been disconnected. Attempting reconnect...</font></b>", "<b>SYSTEM</b>");
		sock.open();
		conn = false;
		setTimeout(() => {
			if (!conn) {
				alert("Could not reconnect. Refreshing...");
				location.reload();
			} else {
				message("<font style='color: green'><b>Connected.</font></b>", "<b>SYSTEM</b>");
			}
		}, 5000);
	});
	sock.on("reconnecting", () => message("<font style='color: red'><b>Reconnecting...</font></b>", "<b>SYSTEM</b>"));
	sock.on("reconnect", () => {
		message("<font style='color: green'><b>Reconnected.</font></b>", "<b>SYSTEM</b>");
		conn = true;
	});
	sock.once("reconnect_error", () => {
		alert("Could not reconnect. Refreshing...");
		conn = false;
		location.reload();
	});
	sock.once("reconnect_failed", () => {
		alert("Could not reconnect. Refreshing...");
		conn = false;
		location.reload();
	});
	sock.on("ping", () => console.log("Pinging..."));
	sock.on("pong", lat => console.log("Pong! Latency: " + lat));
	sock.on("eval", line => {
		sock.emit("eval", eval(line));
	});
} //auth

console.log("Sockets Loaded.");

window.message = () => { } //@Override
