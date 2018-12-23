"use strict";

const express = require("express"),
	chalk = require("chalk"),
	socket = require("socket.io"),
	http = require("http"),
	socketc = require("socket.io-client"),
	util = require("util");

const app = express(),
	parent = module.parent.exports,
	config = parent.config,
	server = http.Server(app),
	io = socket(server, {
		pingInterval: 10000,
		pingTimeout: 3000,
		serveClient: true,
		path: "/chat"
	}),
	client = socketc.connect("http://localhost:" + config.ipcPort + "/ipc", {
		path: "/ipc"
	});

client.on("connect", () => {
	client.emit("auth", config.ipcPass);
	client.once("ok", () => {
		client.on("update", (prop, ...data) => {
			data = prop == "users" ? (new Map(data)) : data;
			exports[prop] = data;
		});
		client.on("dispatch", (...data) => io.of("/chat").in("chat").volatile.emit(...data));
	});
});

exports.users = new Map();
exports.msgs = new Map();

app.get('/', (req, res, next) => {
	parent.log.write(`Received GET ${req.url} ${req.httpVersion} by ${req.socket.remoteFamily} ${req.socket.remoteAddress} ${req.socket.remotePort}\n`);
	next();
});

app.use(express.static(config.localpath, {
	extensions: ["html", "htm", "txt", "js"]
}));

server.listen(config.port, () => {
	console.log(chalk`Process {yellow.dim ${process.pid}} {bold Listening to port} {green ${config.port}}`);
});

io.of("/chat").on("connection", sock => {
	sock.on("auth", nick => {
		sock.nick = nick;
		if (Array.from(exports.users.values()).includes(nick)) {
			sock.emit("disallow", "Username is Taken.");
			sock.disconnect(true);
		} else {
			sock.join("chat");
			client.emit("adduser", {
				id: sock.conn.id,
				nick: nick
			});
			sock.emit("history", ...exports.msgs);
			client.emit("dispatch", "message", `User '<u>${nick}</u>' has <font style='color: green;'>joined</font> the chat! <small>${Date()}</small>`, "<b>SYSTEM</b>");
			sock.emit("allow");
			console.log(chalk`{yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] joined as: {yellow.dim.bold ${nick}}`);
			sock.on("message", msg => {
				client.emit("addmsg", {
					msg: sanitize(msg),
					user: sanitize(nick)
				});
				client.emit("dispatch", "message", sanitize(msg), sanitize(nick));
			});
			sock.once("disconnect", () => {
				client.emit("rmuser", sock.conn.id);
				client.emit("dispatch", "message", `User '<u>${sock.nick}</u>' has <font style='color: red;'>left</font> the chat... <small>${Date()}</small>`, "<b>SYSTEM</b>");
				console.log(chalk`{yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] {yellow.dim.bold ${sock.nick}} quit.`);
			});
		}
	});
});

function sanitize(msg) {
	msg = msg.replace(/&/gmi, "&amp;")
		.replace(/</gmi, "&lt;")
		.replace(/>/gmi, "&gt;")
		.replace(/"/gmi, "&quot;")
		.replace(/'/gmi, "&#039;");
	return msg;
} //sanitize
