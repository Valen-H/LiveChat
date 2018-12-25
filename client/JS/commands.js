"use strict";

class Command {
	constructor(regexp: string, exc: Function = (line: string): any => line, flags: string = "im") {
		this.reg = new RegExp(regexp, flags);
		this.exec = exc;
	} //ctor

	test(against: string = '') {
		if (this.reg.test(against)) {
			return this.exec(against);
		}

		return false;
	} //test
} //Command

let commands: object = {
	disconnect: new Command('^' + prefix + "disc?(onnect)?$", line => sock.disconnect()),
	connect: new Command('^' + prefix + "con(nect)?$", line => sock.open()),
	admin: new Command('^' + prefix + "adm(in)? .+$", line => sock.emit("imAdmin", drop(line)))
};

function command(line: string) {
	for (let i in commands) {
		if (commands[i].test(line)) {
			return;
		}
	}
} //command
