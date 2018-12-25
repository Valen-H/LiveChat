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
	constructor(name, sessId, servId = process.pid, timestamp = Date.now()) {
		this.name = name;
		this.sessId = sessId;
		this.servId = servId;
		this.timestamp = timestamp;
		this.lastMsgTime = this.timestamp + 1000;
	} //ctor
} //User

class Message {
	constructor(user, content = '', timestamp = Date.now()) {
		this.user = user;
		this.content = content;
		this.timestamp = timestamp;
		this.user.lastMsgTime = this.timestamp;
	} //ctor
} //Message

exports.Command = Command;
exports.User = User;
exports.Message = Message;
