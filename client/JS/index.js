let text = {
	shift: false,
	area: null,
	send: null
};

const prefix = "!!";

window.nick = "guest_" + Math.round(Math.random() * 1e5);

while (!(nick = prompt("Insert a Nickname:", nick)) || !/^[a-zA-Z0-9_\-()]+$/i.test(nick)) { }

function send(msg = text.send.value) {
	if (msg.startsWith(prefix)) {
		return;
	}
	sendMessage(msg);
	text.send.value = '';
} //send

function load(e) {
	console.log("Index loaded");

	text.area = document.getElementById("msgarea");
	text.send = document.getElementById("txtarea");

	auth(nick);

	sock.on("message", (msg, nick) => {
		message(msg, nick);
	});
	sock.once("connect", () => text.area.innerHTML = '');
} //load

function sendMessage(msg) {
	if (sock.connected) {
		message(msg, nick);
		sock.send(msg);
	} else {
		message("<font style='color: red'><b>You cannot send messages while disconnected!</b></font>", "System");
	}
} //sendMessage

function message(msg, user) {
	let p = document.createElement("p");
	p.innerHTML = `<b>${user}:</b> ${msg}<br />`;

	text.area.appendChild(p);
} //message

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
}

window.addEventListener("load", load);
