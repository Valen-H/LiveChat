/**
 * FIX HISTORY!!
 */

"use strict";

const express = require("express"),
	chalk = require("chalk"),
	socket = require("socket.io"),
	http = require("http"),
	socketc = require("socket.io-client"),
	url = require("url"),
	util = require("util"),
	fs = require("fs-extra"),
	path = require("path");

const app = express(),
	parent = module.parent.exports,
	config = parent.config,
	classes = parent.classes,
	server = http.Server(app),
	io = socket(server, {
		pingInterval: 10000,
		pingTimeout: 3000,
		serveClient: true,
		path: "/chat"
	}),
	client = socketc.connect("http://127.0.0.1:" + config.ipcPort + "/ipc", {
		path: "/ipc"
	}),
	chat = io.of("/chat"),
	nul = () => { };


exports.update = async function fetch(prop = "users") {
	return client.emit("fetch", prop);
};
exports.users = new Map();
exports.rooms = new Map();
exports.msgs = [ ];


/**
 * LISTENING TO MASTER COMMANDS
 */
//CLIENT
client.on("connect", async () => {
	client.emit("auth", config.ipcPass, process.pid);
	client.once("ok", async () => {
		client.on("update", async (prop, ...data) => {
			exports[prop] = /^(users|rooms)$/.test(prop) ? (new Map(data)) : data;
		});
		client.on("eval", async (txt, cb = nul) => cb(eval(txt)));
		client.on("localeval", async line => chat.in("LOBBY").volatile.emit("eval", line));
		client.on("dispatch", async (chan = "LOBBY", ...data) => chat.in(chan).volatile.emit(...data, chan));  //SEND TO ALL SIBLINGS
		client.on("dispatchTo", async (usr, ...data) => chat.in(usr).volatile.emit(...data));  //SEND TO SPECIFIC SIBLING
		client.emit("fetch", "users");  //FORCE UPDATE
		client.emit("fetch", "rooms");
	});
});
//CLIENT^

app.get('/', async (req, res, next) => {
	parent.log.write(`Received GET ${req.url} ${req.httpVersion} by ${req.socket.remoteFamily} ${req.socket.remoteAddress} ${req.socket.remotePort}\n`);
	next();
});

app.get(/\.(html?|js|css)x$/i, async  (req, res, next) => {
	let uri = url.parse(req.url), pth;

	fs.access(pth = path.join(config.localpath, uri.pathname), fs.constants.F_OK, async err => {
		if (err) {
			next();
		} else {
			fs.readFile(pth, async (err, data) => {
				if (err) {
					next();
				} else {
					let mode = "text/html";
					switch (path.extname(uri.pathname)) {
						case ".htmx":
						case ".htmlx":
							break;
						case ".jsx":
							mode = "text/javascript";
							break;
						case ".cssx":
							mode = "text/css";
							break;
					}

					res.set({ "content-type": mode + "; charset=utf-8" });  //RENDERED AS PLAINTEXT WITHOUT
					res.end(data.toString().replace(/@@(?!\\)(.+?)@@(?!\\)/mi, (match, p1, p) => eval(p)).replace(/@@\\/gi, "@@"));
				}
			});
		}
	});
});

app.use(express.static(config.localpath, {
	extensions: ["htmx", "html", "htm", "htmlx", "txt", "js", "jsx", "css", "cssx"]
}));

server.listen(config.port, async () => {
	console.log(chalk`Process {yellow.dim ${process.pid}} {bold Listening to port} {green ${config.port}}`);
});

chat.on("connection", async sock => {
	client.emit("fetch", "rooms");
	sock.once("auth", async nick => {
		if (Array.from(exports.users.values()).some(usr => usr.name == nick) || !/^[a-zA-Z0-9_\-();' ]+$/i.test(nick)) {
			sock.emit("disallow", "Username is Taken/Invalid.");
			sock.disconnect(true);
		} else {
			console.log(chalk`{yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] joined as: {yellow.dim.bold ${nick}}`);
			sock.prvroom = "USR" + nick;
			sock.nick = nick;
			sock.room = "LOBBY";

			sock.join("LOBBY", async err => {
				if (!err) {
					sock.emit("joined", "LOBBY");
					sock.emit("main", "LOBBY");
				}
			});
			sock.join(sock.prvroom, async err => !err && sock.emit("joined", sock.prvroom));

			client.emit("adduser", {
				sessId: sock.conn.id,
				name: nick,
				servId: process.pid
			});

			sock.on("message", async msg => {
				if (!msg) {
					sock.send("<font color='red'><b>You cannot send an empty message!</b></font>", "<font color='red'><b>SYSTEM</b></font>");
					return;
				} else if (Math.abs(Date.now() - exports.users.get(sock.conn.id).lastMsgTime) <= config.msgThreshold) {
					sock.send(`<font color='red'><b>Please wait ${config.msgThreshold / 1000}s before sending another message!</b></font>`, "<font color='red'><b>SYSTEM</b></font>");
					return;
				}
				let ms = sanitize(msg, sock);
				client.emit("addmsg", {
					msg: ms,
					user: sock.conn.id
				});
				client.emit("dispatch", sock.room, "message", ms, sanitize(nick, sock));
				client.emit("fetch", "rooms");
			});
			sock.on("switch", async (room, pass) => {
				if (exports.rooms.has(room) && (exports.rooms.get(room).pass == pass || exports.users.get(sock.conn.id).rooms.includes(room))) {
					sock.leave(sock.room, async err => {
						!err && sock.join(room, async err => {
							if (!err) {
								sock.emit("main", sock.room = room);
								client.emit("switchroom", sock.conn.id, room, pass);
								sock.emit("history", ...ofRoom(room));
							}
						});
					});
				} else {
					sock.emit("alert", "Password Incorrect.");
					sock.emit("history", ...ofRoom(sock.room));
				}
			});
			sock.once("imAdmin", async pass => {  //SHALL NOT REPLY FOR SECURITY REASONS
				if (config.adminPass == pass.trim()) {
					sock.join("admin");
					console.log(chalk`{underline {yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] ${nick} WAS GRANTED ADMINISTRATION RIGHTS!} {gray ${Date()}}`);
				} else {
					console.log(chalk`{underline {yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] ${nick} TRIED TO GET ADMINISTRATION RIGHTS WITH PASS: ${pass}} {gray ${Date()}}`);
				}

				sock.on("cli", async line => client.emit("cli", line));
			});
			sock.once("disconnect", async () => {
				client.emit("rmuser", sock.conn.id);
				client.emit("dispatch", "LOBBY", "message", `User '<u>${sock.nick}</u>' has <font color='red'>left</font> the chat... <small>${Date()}</small>`, "<font color='red'><b>SYSTEM</b></font>");
				console.log(chalk`{yellow.dim.italic ${sock.conn.id}} [${sock.conn.remoteAddress}] {yellow.dim.bold ${sock.nick}} quit.`);
			});

			sock.emit("history", ...ofRoom("LOBBY"));
			client.emit("dispatch", "LOBBY", "message", `User '<u>${nick}</u>' has <font color='green'>joined</font> the chat! <small>${Date()}</small>`, "<font color='red'><b>SYSTEM</b></font>");
			sock.emit("allow");
		}
	});
});

function ofRoom(name) {
	return exports.rooms.get(name).messages;
} //ofRoom

function sanitize(msg, sock) {
	msg = msg.replace(/&/gmi, "&amp;")
		.replace(/</gmi, "&lt;")
		.replace(/>/gmi, "&gt;")
		.replace(/"/gmi, "&quot;")
		.replace(/\$USR/gi, sock.nick)  //COMMANDS
		.replace(/\$d/gi, Date())
		.replace(/\$b((.|\n)+?)\$b/gmi, "<b>$1</b>")
		.replace(/\$i((.|\n)+?)\$i/gmi, "<i>$1</i>")
		.replace(/\$u((.|\n)+?)\$u/gmi, "<u>$1</u>")
		.replace(/\$\\/g, '$')
		.replace(/'/gmi, "&#039;");
	return msg;
} //sanitize
