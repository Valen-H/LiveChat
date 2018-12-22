window.auth = function auth(nick) {
	window.sock = io.connect("/chat", {
		reconnectionAttempts: 50
	});

	sock.once("disallow", msg => {
		alert(msg);
		location.reload();
	});
	sock.once("allow", () => console.log("Successful Login."));
	sock.once("connect", () => sock.emit("auth", nick));
	sock.once("disconnect", () => {
		alert("You have been disconnected.");
	});
} //auth

console.log("Sockets Loaded.");
