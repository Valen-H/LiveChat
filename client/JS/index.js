"use strict";

let text: object = {
	shift: false,
	area: null,
	send: null
},
	scroll: number = 100,
	historyIdx: number = 0,
	hist: Array = [ ],
	maxHistory: number = 50;

const prefix: string = "!!";

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

	auth(nick);
	setCookie("user", nick);
	parseQueries();
	
	sock.on("message", (msg: string, nick: string): void => {
		message(msg, nick);
	});
	sock.once("history", (...data: string[]): void => {
		for (let i of data) {
			console.dir(i);
			message(i.content, i.user.name);
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

function send(msg: string = text.send.value): void {
	text.send.value = '';
	if (msg.startsWith(prefix)) {
		return command(msg);
	}
	msg = msg.trim();
	sendMessage(msg);
} //send

function sendMessage(msg: string): void {
	if (!msg) {
		message("<font color='red'><b>You cannot send an empty message!</b></font>", "<font color='red'><b>SYSTEM</b></font>");
	} else if (conn) {
		sock.send(msg);
	} else {
		message("<font color='red'><b>You cannot send messages while disconnected!</b></font>", "<font color='red'><b>SYSTEM</b></font>");
	}
} //sendMessage

function message(msg: string, user: string): void {
	let p = document.createElement("p");
	p.innerHTML = `<font color='gray'><small>${(new Date()).toDateString()}</small></font>&emsp;<b>${user}:</b> ${msg}<br />`;
	
	text.area.appendChild(p);
	if (text.area.scrollBy) {
		text.area.scrollBy(0, scroll);
	}
} //message

function shiftcheck(event: object, down: boolean = true): void {
	if (event.key == "Shift") {
		text.shift = down;
	} else if (event.key == "ArrowUp" && down) {
		++historyIdx;
		historyIdx %= hist.length;
		text.send.value = hist[historyIdx];
		return;
	} else if (event.key == "ArrowUp") {
		return;
	} else if (event.key == "ArrowDown" && down) {
		historyIdx = (historyIdx < 1) ? (hist.length - 1) : (historyIdx - 1);
		text.send.value = hist[historyIdx];
		return;
	} else if (event.key == "ArrowDown") {
		return;
	} else if (event.key == "Enter" && !text.shift && !down) {
		send();
		hist.unshift('');
		while (hist.length >= maxHistory) {
			hist.pop();
		}
	}
	hist[0] = text.send.value;
} //shiftcheck

function submit(e?: object): void {
	text.shift = false;
	shiftcheck({
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
