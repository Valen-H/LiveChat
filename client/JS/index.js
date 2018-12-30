"use strict";

let text: object = {
	shift: false,
	area: null,
	send: null,
	room: null,
	user: null
},
	scroll: number = 100,
	historyIdx: number = 0,
	hist: Array = [''],
	maxHistory: number = 50,
	rooms: object = { },
	room: string = "LOBBY",
	last = 0;

const prefix: string = "!!",
	threshold = 800;

window.has = [ ];

window.nick = getCookie("user") || "guest_" + Math.round(Math.random() * 1e5);

while (!(nick = prompt("Insert a Nickname:", nick || getCookie("user"))) || !/^[a-zA-Z0-9_\-();' ]+$/i.test(nick)) { }

function drop(line: number, t: number = 1): string {
	line = line.split(' ');
	while (t--) {
		line.shift();
	}
	return line.join(' ');
} //drop

function dropGet(line: number, t: number = 0): string {
	line = line.split(' ');
	while (t--) {
		line.shift();
	}
	return line.shift();
} //dropGet

async function load(e?: object): void {
	console.log("Index loaded");

	text.area = document.getElementById("msgarea");
	text.send = document.getElementById("txtarea");
	text.room = document.getElementById("rooms");
	text.user = document.getElementById("users");

	if (window.innerWidth <= 500) {
		text.room.classList.add("shrink");
	}

	auth(nick);
	setCookie("user", nick);
	parseQueries();
	resize();
	
	Array.from(document.querySelectorAll("script, link, img, audio, iframe")).forEach(el => {
		let app = el.src || el.href;

		if (app) {
			window.has.push(app.replace(/^https?:\/{2}.+?\//gmi, ''));
		}
	});
	
	sock.on("message", async (msg: string, nick: string, rm: string): void => {
		if (rm == room) message(msg, nick);
	});
	sock.on("joinable", (chan, pass) => {
		let chann = chan;
		if (chan in rooms) {
			let p = rooms[chan];
			p.onclick = function click(e?: object) {
				switchCur(chan, pass ? undefined : '');
			};
			return;
		}
		if (chan.startsWith("USR")) {
			chann = `Private Channel\n (${chan})`;
		}
		let p = document.createElement("p");
		p.classList.add("channel");
		p.innerHTML = chann;
		p.onclick = function click(e?: object) {
			switchCur(chan, pass ? undefined : '');
		};
		rooms[chan] = p;
		text.room.appendChild(p);
	});
	sock.on("left", () => { });  //IMPL
	sock.on("main", name => {
		rooms[room].classList.remove("selected-chan");
		rooms[name].classList.add("selected-chan");
		room = name;
	});
	sock.on("history", async (...data: string[]): void => {
		for (let i of data) {
			if (i.room == room) message(i.content, i.user, (new Date(i.timestamp)).toDateString());
		}
	});
	sock.once("connect", (): void => {
		text.area.innerHTML = '';
		message("This is a Beta version of a chatting service, upcoming features are: profile picture support, multiple chatrooms and more security!", "<font color='red'><b>SYSTEM</b></font>");
		message("<b>THIS SERVER DOES NOT FOLLOW PRIVACY RULES!! USE AT YOUR OWN AGREEMENT (GDPR)</b>", "<font color='red'><b>SYSTEM</b></font>");
		message("<u>Please be kind and don't spam, we have means of banning aggitators.</u>", "<font color='red'><b>SYSTEM</b></font>");
		console.info("The prefix is !!, type !!help in chat for commands.");
	});
} //load

function parexp(del = true) {
	if (del) {
		return setTimeout(parexp, 300, false);
	}
	let exp = 60;
	if (text.room.classList.contains("shrink-r")) {
		text.area.classList.add("msgarealeft");
		exp += 20;
		console.info(text.area.style.left);
	} else {
		text.area.classList.remove("msgarealeft");
	}
	if (text.user.classList.contains("shrink-l")) {
		exp += 20;
	}
	return text.area.style.width = exp + "%";
} //parexp

function alrel(text) {
	alrel = () => { };
	alert(text);
	return location.reload();
} //alrel

function switchCur(name: string = "LOBBY", pass: string = prompt("Password (Leave empty for public rooms or already authorized rooms)", ''), visible: boolean = true) {
	sock.emit("switch", name, pass, visible);
	return text.area.innerHTML = '';
} //switchCur

function send(msg: string = text.send.value): void {
	text.send.value = '';
	if (msg.startsWith(prefix)) {
		return command(msg);
	}
	msg = msg.replace(/\${((.|\n)+?)}/gm, (match, p) => eval(p));
	msg = msg.trim();
	return sendMessage(msg);
} //send

function sendMessage(msg: string): void {
	if (!msg) {
		return message("<font color='red'><b>You cannot send an empty message!</b></font>", "<font color='red'><b>SYSTEM</b></font>");
	} else if (Date.now() - last <= threshold) {
		return message(`<font color='red'><b>Please wait ${threshold / 1000}s before sending another message!</b></font>`, "<font color='red'><b>SYSTEM</b></font>");
	} else if (conn) {
		sock.send(msg);
		return last = Date.now();
	} else {
		return message("<font color='red'><b>You cannot send messages while disconnected!</b></font>", "<font color='red'><b>SYSTEM</b></font>");
	}
} //sendMessage

function message(msg: string, user: string, date: string = (new Date()).toDateString()): void {
	let p = document.createElement("p");
	p.innerHTML = `<font color='gray'><small>${date}</small></font>&emsp;<b>${user}:</b> ${msg}<hr />`;
	
	text.area.appendChild(p);
	if (text.area.scrollBy) {
		return text.area.scrollBy(0, scroll);
	} else {
		return text.area.scrollTop += scroll;
	}
} //message

function shiftcheck(event: object, down: boolean = true): void {
	if (event.key == "Shift") {
		text.shift = down;
	} else if (event.key == "ArrowUp" && down) {
		++historyIdx;
		historyIdx %= hist.length;
		return text.send.value = hist[historyIdx];
	} else if (event.key == "ArrowUp") {
		return;
	} else if (event.key == "ArrowDown" && down) {
		historyIdx = (historyIdx < 1) ? (hist.length - 1) : (historyIdx - 1);
		return text.send.value = hist[historyIdx];
	} else if (event.key == "ArrowDown") {
		return;
	} else if (event.key == "Enter" && !text.shift && !down) {
		send();
		hist.unshift('');
		while (hist.length >= maxHistory) {
			hist.pop();
		}
	}
	return hist[0] = text.send.value;
} //shiftcheck

function submit(e?: object): void {
	text.shift = false;
	return shiftcheck({
		key: "Enter"
	}, false);
} //submit

function sanitize(msg: string): string {
	msg = msg.replace(/&/gmi, "&amp;")
		.replace(/</gmi, "&lt;")
		.replace(/>/gmi, "&gt;")
		.replace(/"/gmi, "&quot;")
		.replace(/'/gmi, "&#039;");
	return msg;
} //sanitize

function parseCookies(cookies: string = document.cookie): Map {
	return new Map(cookies.split(';').map(c => c.split('=')));
} //parseCookies

function storeCookies(map: Map): string {
	return document.cookie = Array.from(map).map(a => a.join('=')).join(';');
} //storeCookies

function setCookie(key: string, value: string): string {
	let tmp = parseCookies();
	tmp.set(key, value);
	return storeCookies(tmp);
} //setCookie

function getCookie(key: string): string {
	let tmp: Map = parseCookies();
	return tmp.get(key);
} //getCookie

function parseQueries(loc: string = location.href) {
	let out = loc.split('?').pop().replace(/#.*?$/, '').split('&').map(q => q.split('='));

	for (let i of out) {
		window[i.shift()] = i.pop();
	}
} //parseQueries

window.addEventListener("DOMContentLoaded", load);
window.addEventListener("resize", window.resize = function resize(e) {
	let xp = document.getElementsByClassName("xpand");
	xp[1].style.left = (document.getElementById("ui-wrapper").offsetWidth - xp[1].offsetWidth - xp[0].offsetLeft) + "px";
});
