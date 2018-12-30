"use strict";

class Command {
	constructor(regexp: string, exc: Function = (line: string): any => line, flags: string = "im") {
		this.reg = new RegExp(regexp, flags);
		this.exec = exc;
	} //ctor

	test(against: string = ''): any {
		if (this.reg.test(against)) {
			return this.exec(against);
		}

		return false;
	} //test
} //Command

let commands: object = {
	disconnect: new Command('^' + prefix + "disc?(onnect)?$", async (): any => sock.disconnect()),
	connect: new Command('^' + prefix + "con(nect)?$", async (): any => sock.open()),
	admin: new Command('^' + prefix + "adm(in)? .+$", async (line: string): any => sock.emit("imAdmin", drop(line))),
	cli: new Command('^' + prefix + "cli ", async (line: string): boolean => sock.emit("cli", drop(line.trim()))),
	help: new Command('^' + prefix + "he?lp$", (): any => message("Available commands are : disconnect, connect, help", "<font color='red'><b>SYSTEM</b></font>"))
};

function command(line: string): void {
	for (let i in commands) {
		if (commands[i].test(line)) {
			return;
		}
	}

	message(`Command '${line}' not found.`, "<font color='red'><b>SYSTEM</b></font>");
} //command

console.info("Commands loaded.");
