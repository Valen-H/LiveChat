let text = {
	shift: false,
	area: null,
	send: null
},
	scroll = 100;

const prefix = "!!";

window.nick = getCookie("user") || "guest_" + Math.round(Math.random() * 1e5);

while (!(nick = prompt("Insert a Nickname:", nick || getCookie("user"))) || !/^[a-zA-Z0-9_\-()]+$/i.test(nick)) { }

function send(msg = text.send.value) {
	if (msg.startsWith(prefix)) {
		return;
	}
	msg = msg.trim();
	sendMessage(msg);
	text.send.value = '';
} //send

function load(e) {
	console.log("Index loaded");

	text.area = document.getElementById("msgarea");
	text.send = document.getElementById("txtarea");

	auth(nick);
	setCookie("user", nick);
	
	sock.on("message", (msg, nick) => {
		message(msg, nick);
	});
	sock.once("history", (...data) => {
		for (let i of data) {
			message(i.pop(), i.pop());
		}
	});
	sock.once("connect", () => {
		text.area.innerHTML = '';
		message("This is a Beta version of a chatting service, upcoming features are: profile picture support, message history view, spam defense, multiple chatrooms and more security!", "<b>SYSTEM</b>");
		message("<u>Please be kind and don't spam, we have means of banning aggitators.</u>", "<b>SYSTEM</b>");
		console.info("The prefix is !!, type !!help in chat for commands.");
	});
} //load

function sendMessage(msg) {
	if (!msg) {
		message("<font style='color: red'><b>You cannot send an empty message!</b></font>", "<b>SYSTEM</b>");
	} else if (sock.connected && !sock.disconnected) {
		sock.send(msg);
	} else {
		message("<font style='color: red'><b>You cannot send messages while disconnected!</b></font>", "<b>SYSTEM</b>");
	}
} //sendMessage

function message(msg, user) {
	let p = document.createElement("p");
	p.innerHTML = `<b>${user}:</b> ${msg}<br />`;
	
	text.area.appendChild(p);
	text.area.scrollHeight += scroll;
	if (text.area.scrollBy) {
		text.area.scrollBy(0, scroll);
	}
} //message
window.message = message;

function shiftcheck(event, down = true) {
	if (event.key == "Shift") {
		text.shift = down;
	}
	if (event.key == "Enter" && !text.shift && !down) {
		send();
	}
} //shiftcheck

function submit(event) {
	text.shift = false;
	shiftcheck({
		key: "Enter"
	}, false);
} //submit

function sanitize(msg) {
	msg = msg.replace(/&/gmi, "&amp;")
		.replace(/</gmi, "&lt;")
		.replace(/>/gmi, "&gt;")
		.replace(/"/gmi, "&quot;")
		.replace(/'/gmi, "&#039;");
	return msg;
} //sanitize

function parseCookies(cookies = document.cookie) {
	return new Map(document.cookie.split(';').map(c => c.split('=')));
} //parseCookies

function storeCookies(map) {
	return document.cookie = Array.from(map).map(a => a.join('=')).join(';');
} //storeCookies

function setCookie(key, value) {
	let tmp = parseCookies();
	tmp.set(key, value);
	return storeCookies(tmp);
} //setCookie

function getCookie(key) {
	let tmp = parseCookies();
	return tmp.get(key);
} //getCookie

window.addEventListener("DOMContentLoaded", load);
