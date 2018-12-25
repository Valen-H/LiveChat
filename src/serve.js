"use strict";

const express = require("express"),
	chalk = require("chalk"),
	socket = require("socket.io"),
	http = require("http"),
	socketc = require("socket.io-client"),
	util = require("util"),
	url = require("url"),
	fs = require("fs-extra"),
	path = require("path");

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
		client.on("localeval", line => io.of("/chat").in("CHAT").volatile.emit("eval", line));
		client.on("dispatch", (...data) => io.of("/chat").in("CHAT").volatile.emit(...data));
		client.on("dispatchTo", (usr, ...data) => io.of("/chat").in("USR" + usr).volatile.emit(...data));
	});
});

exports.users = new Map();
exports.msgs = new Map();

app.get('/', (req, res, next) => {
	parent.log.write(`Received GET ${req.url} ${req.httpVersion} by ${req.socket.remoteFamily} ${req.socket.remoteAddress} ${req.socket.remotePort}\n`);
	next();
});

app.get("*.htmx", (req, res, next) => {
	let uri = url.parse(req.url), pth;

	fs.access(pth = path.join(config.localpath, uri.pathname), fs.constants.F_OK, err => {
		if (err) {
			next();
		} else {
			fs.readFile(pth, (err, data) => {
				if (err) {
					next();
				} else {
					let mode = "text/html";
					switch (path.extname(uri.pathname)) {
						case ".htmx":
						case ".htmlx":
							break;
						case "jsx":
							mode = "text/javascript";
							break;
						case "cssx":
							mode = "text/css";
							break;
					}

					res.set({ "content-type": mode + "; charset=utf-8" });
					res.end(data.toString().replace(/@@(?!\\)(.+?)@@(?!\\)/mi, (match, p1, p) => eval(p)).replace(/@@\\/gi, "@@"));
				}
			});
		}
	});
});

app.use(express.static(config.localpath, {
	extensions: ["htmx", "html", "htm", "txt", "js"]
}));

server.listen(config.port, () => {
	console.log(chalk`Process {yellow.dim ${process.pid}} {bold Listening to port} {green ${config.port}}`);
});

io.of("/chat").on("connection", sock => {
	sock.once("auth", nick => {
		sock.nick = nick;
		if (Array.from(exports.users.values()).includes(nick) || !/^[a-zA-Z0-9_\-();' ]+$/i.test(nick)) {
			sock.emit("disallow", "Username is Taken/Invalid.");
			sock.disconnect(true);
		} else {
			sock.join("CHAT");
			sock.join("USR" + nick);
			client.emit("adduser", {
				id: sock.conn.id,
				nick: nick
			});
			sock.emit("history", ...exports.msgs);
			client.emit("dispatch", "message", `User '<u>${nick}</u>' has <font style='color: green;'>joined</font> the chat! <small>${Date()}</small>`, "<b>SYSTEM</b>");
			sock.emit("allow");
			console.log(chalk`{yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] joined as: {yellow.dim.bold ${nick}}`);
			sock.on("message", msg => {  //BRUTEFORCE_EXPOSED
				client.emit("addmsg", {
					msg: sanitize(msg),
					user: sanitize(nick)
				});
				client.emit("dispatch", "message", sanitize(msg), sanitize(nick));
			});
			sock.once("imAdmin", pass => {  //BRUTEFORCE_EXPOSED
				if (config.adminPass == pass.trim()) {
					sock.join("admin");
					console.log(chalk`{underline {yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] ${nick} WAS GRANTED ADMINISTRATION RIGHTS!} {gray ${Date()}}`);
				} else {
					console.log(chalk`{underline {yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] ${nick} TRIED TO GET ADMINISTRATION RIGHTS WITH PASS: ${pass}} {gray ${Date()}}`);
				}
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
