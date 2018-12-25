"use strict";

class Command {
	constructor(regexp, exc = line => line, flags = "im") {
		this.reg = new RegExp(regexp, flags);
		this.exec = exc;
	} //ctor

	test(against = "") {
		if (this.reg.test(against)) {
			return this.exec(against);
		}

		return false;
	} //test
} //Command

class User {
	constructor(name, sessId, servId = process.pid) {
		this.name = name;
		this.sessId = sessId;
		this.servId = servId;
	} //ctor
} //User

exports.Command = Command;
