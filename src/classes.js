/**
 * CONVERT MESSAGE SYSTEM TO ROOM-SPECIFIC,
 * IMPLEMENT EASE-FUNCTIONS (@OVERRIDE)
 */


"use strict";

const parent = module.parent.exports;

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
		this.lastMsgTime = this.timestamp - parent.config.msgThreshold;
		this.room = '';
		this.rooms = [ ];
		parent.users.set(this.sessId, this);
		User.update();
	} //ctor

	addmsg(content) {
		parent.rooms.get(this.room).addmsg(this.name, content);
		return User.update();
	} //addmsg

	switch(room, pass = '') {
		if (this.rooms.includes(room)) {
			this.room = room;
			return User.update();
		} else {
			if (join(room, pass)) {
				this.room = room;
				return User.update();
			} else {
				return false;
			}
		}
	} //switch

	join(room, pass, visibility) {
		if (parent.rooms.has(room) && (parent.rooms.get(room).pass == pass || parent.rooms.get(room).owner == this.name)) {
			if (!this.rooms.includes(room)) {
				this.rooms.push(room);
				parent.rooms.get(room).adduser(this.sessId);
				if (!this.room) this.switch(room, pass);
				return User.update();
			}
		} else if (!parent.rooms.has(room)) {
			new Room(room, pass, this.name, visibility);
			this.join(room, pass);
			return User.update();
		} else {
			return false;
		}
	} //join

	static update() {
		return parent.update("users");
	} //update

	leave(room) {
		parent.rooms.get(room).rmuser(this.sessId);

		if (this.room == room) {
			this.room = "LOBBY";
		}

		return User.update();
	} //leave

	quit() {
		for (let i of this.rooms) {
			this.leave(i);
		}

		parent.users.delete(this.sessId);
		return User.update();
	} //quit

	ban(reason = '') {

	} //ban

	setPic() {

	} //setPic
} //User

class Message {
	constructor(user, content = '', room = parent.rooms.get("LOBBY"), timestamp = Date.now()) {
		this.user = user;
		this.content = content;
		this.timestamp = timestamp;
		Array.from(parent.users).filter(ar => ar[1].name == this.user)[0][1].lastMsgTime = this.timestamp;
		this.room = room;
		this.id = Message._id++;
		User.update();
	} //ctor

	delete() {
		parent.rooms.get(this.room).messages = parent.rooms.get(this.room).messages.filter(msg => msg.id != this.id);
		return Room.update();
	} //delete
} //Message

class Room {
	constructor(name, pass = '', owner, visible = true) {
		this.name = name;
		this.pass = pass;
		this.owner = owner;
		this.visible = visible;
		this.messages = [ ];
		this.members = [ ];
		parent.rooms.set(this.name, this);
		Room.update();
	} //ctor

	addmsg(user, content) {  //sessId
		this.messages.push(new Message(user, content, this.name));

		while (this.messages.length >= parent.config.msgThreshold) {
			this.messages.shift();
		}

		return Room.update();
	} //addmsg

	adduser(user) {  //sessId
		if (!this.members.includes(user)) {
			this.members.push(user);
		}

		return Room.update();
	} //adduser

	rmuser(user) {
		parent.users.get(user).rooms = parent.users.get(user).rooms.filter(rm => rm != this.name);
		this.members = this.members.filter(usr => usr != user);
		return Room.update();
	} //rmuser

	static update() {
		return parent.update("rooms");
	} //update

	delete() {
		for (let i of this.members) {
			parent.users.get(i).leave(this.name);
		}

		parent.rooms.delete(this.name);
		return Room.update();
	} //delete

	changePass(newpass = this.pass) {
		for (let member of this.members) {
			if (member.name != this.owner) member.leave(this.name);
		}

		this.pass = newpass;
		return Room.update();
	} //changePass
} //Room

Message._id = 0;

exports.Command = Command;
exports.User = User;
exports.Message = Message;
exports.Room = Room;
