/** @TODO
 * ADD MULTIPLE ROOMS, PROFILES AND BANS,
 * ADD IN-PLACE CLIENT-COMMANDS LIKE: my name is ${nick}!  ---
 * ABILITY TO SAVE MESSAGE-HISTORY/ROOMS (?) UPON RELAUNCH
 */

/** ROOM THEORY
 * EXPOSES A VISIBLE ROOM LIST
 * BUTTONS: MAKE ROOM, JOIN ROOM
 * MAKING ROOM ALLOWS SETTING PASSWORD AND VISIBILITY OF NEW ROOM
 * JOINING ROOM REQUIRES PASSWORD ONCE UNLESS PASSWORD CHANGES AFTER FIRST AUTH
 * USR... -> USER-PRIVATE CHANNELS  ---
 * LOBBY -> GLOBAL CHANNEL  ---
 */



const readline = exports.readline = require("readline"),
	cluster = exports.cluster = require("cluster"),
	os = exports.os = require("os"),
	chalk = exports.chalk = require("chalk"),
	util = exports.util = require("util"),
	cp = exports.cp = require("child_process"),
	fs = exports.fs = require("fs-extra"),
	strip = exports.stripAnsi = require("strip-ansi"),
	path = exports.path = require("path"),
	socket = exports.socket = require("socket.io");

const config = exports.config = require("./configs/config.json"),
	classes = exports.classes = require("./src/classes.js"),
	yes = exports.yes = /^(ye?s?|ok|sure|true|affirmative)$/i;


//SETUP

const logs = exports.log = fs.createWriteStream(config.logfile, {
	flags: 'a+',
	mode: 0o750
});

exports.update = () => { }  //@Override
exports.users = new Map();  //MAPPED BY sessId
exports.rooms = new Map();  //MAPPED BY name
exports.procs = new Map();  //MAPPED BY pid
exports.msgs = [ ];

util.inspect.defaultOptions.getters = util.inspect.defaultOptions.sorted = util.inspect.defaultOptions.showHidden = true;
util.inspect.defaultOptions.depth = 3;
util.inspect.defaultOptions.maxArrayLength = 50;

for (let i in process.env) {
	config[i] = process.env[i];
}

console._log = console.log;
console.log = function log(...args) {
	exports.log.write(strip(args.join(' ')) + '\n');
	return console._log(...args);
};
console._error = console.error;
console.error = function error(...args) {
	exports.log.write(strip(args.join(' ') + '\n'));
	return console._error(...args);
};

process.on("uncaughtException", err => {
	console.error(chalk.red(util.inspect(err)));
});

process.on("unhandledRejection", err => {
	console.error(chalk.redBright(util.inspect(err)));
});
//SETUP ^


//COMMANDS
let commands = exports.commands = {
	exit: new classes.Command('^\\' + config.prefix + "e(xit)?$", async () => {
		exports.log.write("Shutting Down... " + Date());
		process.exit();
		return true;
	}),
	quit: new classes.Command('^\\' + config.prefix + "q(uit)?$", async () => {
		rl.close();
		console.info(chalk.bold("CLI disabled!"));
		return true;
	}),
	system: new classes.Command('^\\' + config.prefix + "s(ys(call)?)? .+$", async line => syscall(drop(line))),
	restart: new classes.Command('^\\' + config.prefix + "r(e(s(tart)?|l(oad)?))?$", async () => process.exit(1)),
	clear: new classes.Command('^\\' + config.prefix + "c(l(ea(r|n))?)?$", async () => {
		readline.cursorTo(process.stdout, 0, 0);
		readline.clearScreenDown(process.stdout);
		return true;
	}),
	wipe: new classes.Command('^\\' + config.prefix + "w(ipe)?( \\d+)?$", async line => {
		let targ = Array.from(exports.rooms.values()).find(rm => rm.name == "LOBBY").messages,
			times = drop(line) || targ.length;
		const t = times;
		while (times--) {
			targ.pop();
		}
		console.log(chalk.bold(chalk.magenta(t) + " messages wiped!"));
		update("rooms");
		return true;
	}),
	logs: new classes.Command('^\\' + config.prefix + "l(ogs?)?$", async () => fs.createReadStream(config.logfile).pipe(process.stdout)),
	erase: new classes.Command('^\\' + config.prefix + "(erase|ers?)$", async () => {
		exports.rl.question(chalk.bold("Are you sure you want to erase the logs? [THIS ACTION WILL BE RECORDED]: "), ans => {
			if (yes.test(ans)) {
				fs.truncate(config.logfile, 0, err => {
					if (!err) {
						console.log(chalk.bold("Logs Erased."), chalk.gray(Date()));
					} else {
						console.info(chalk.bold(`${config.logfile} could not be truncated!`));
					}
				});
			} else {
				console.info(chalk.italic("Aborted."));
			}
			return true;
		});
		return true;
	}),
	say: new classes.Command('^\\' + config.prefix + "say .+? .+$", async line => {
		return transmit("dispatchTo", dropGet(line, 1), "message", drop(drop(line)), "<font color='red'><b>ADMIN</b></font>");
	}),
	sayall: new classes.Command('^\\' + config.prefix + "sayall .+$", async line => {
		return transmit("dispatch", "message", drop(line), "<font color='red'><b>ADMIN</b></font>");
	}),
	localeval: new classes.Command('^\\' + config.prefix + "e(v(al)?)? .+$", async line => transmit("localeval", drop(line))),
	refresh: new classes.Command('^\\' + config.prefix + "ref(r(esh)?)?( .+)?$", async line => {
		if (line.split(' ').length >= 2) {
			transmit("localeval", `if (nick == "${drop(line)}") {alert("Server commands you to Refresh.");location.reload()}`);
		} else {
			transmit("localeval", "alert('Server issued Refresh.');location.reload()");
		}
		return true;
	}),
	help: new classes.Command('^\\' + config.prefix + "he?lp$", async () => console.info(Object.keys(commands)) || true),
	eval: new classes.Command('', async line => console.log(chalk.gray(util.inspect(eval(line)))) || true)
}, ipc;
//COMMANDS ^


//CLUSTER/RL/IPC/WATCH
if (cluster.isMaster) {
	require("./src/setup.js");
	exports.log.write("Server launched at " + Date() + '\n');

	ipc = exports.ipc = socket({
		serveClient: false,
		path: "/ipc"
	});

	ipc.attach(config.ipcPort, {
		cookie: false
	});

	(ipc = exports.ipc = ipc.of("/ipc")).on("connection", async sock => {
		sock.once("auth", async (code, id) => {
			if (code != config.ipcPass) {
				sock.emit("disallowed");
				return sock.disconnect(true);
			}
			sock.join("CLNT" + id);
			sock.join("ipc");
			sock.on("adduser", adduser);
			sock.on("rmuser", rmuser);
			sock.on("switchroom", switchroom);
			sock.on("addmsg", addmsg);
			sock.on("addroom", addroom);
			sock.on("cli", exports.rlline);
			sock.on("eval", eval);
			sock.on("fetch", update);
			sock.on("dispatch", async (...data) => ipc.in("ipc").volatile.emit("dispatch", ...data));
			sock.on("dispatchTo", async (to, ...data) => ipc.to(to).emit("dispatch", ...data));
			sock.emit("ok");
		});
	});

	new classes.Room("LOBBY", '', "<SYSTEM>", true);

	for (let cpu of os.cpus()) {
		let wrk = cluster.fork();
		wrk.on("online", () => exports.procs.set(wrk.process.pid, wrk));
		wrk.on("exit", () => exports.procs.delete(wrk.process.pid));
	}

	let rl = exports.rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	
	rl.on("line", exports.rlline = async line => {
		exports.log.write(`Issued: '${line}' at ${Date()}\n`);

		for (let i in commands) {
			if (commands[i].test(line)) {
				return;
			}
		}

		console.info("Command not Found");
	});

	!process.env.BLOCKRELOAD && (exports.watchersrc = fs.watch(path.join(__dirname, "src"), {
		persistent: false
	}, async (evt, file) => {
		if (file.endsWith(".js")) {
			exports.rl.write(config.prefix + "reload\n");
		}
	}));

	!process.env.BLOCKRELOAD && (exports.watcherroot = fs.watch("./", {
		persistent: false
	}, async (evt, file) => {
		if (file.endsWith(".js")) {
			exports.rl.write(config.prefix + "reload\n");
		}
	}));
	
	!process.env.BLOCKBUILD && syscall("npm run build");
	
	process.once("exit", async code => {
		console.info(chalk.cyan(code));
		exports.log.write("Master exited at '" + Date() + `' with ${code}\n`);
	});
} else {
	require("./src/serve.js");
}
//CLUSTER/RL/IPC/WATCH ^


//FUNCTIONS

async function addmsg(msg) {
	return await exports.users.get(msg.user).addmsg(msg.msg);
} //addmsg

async function adduser(user) {
	new classes.User(user.name, user.sessId, user.servId);
	joinroom(user.sessId, "LOBBY", '', true);
	joinroom(user.sessId, "USR" + user.name, user.sessId, false);
	await update("users");
	await update("rooms");
} //adduser

async function switchroom(sessId, room = "LOBBY", pass = '') {
	exports.users.get(sessId).switch(room, pass);
	await update("users");
	await update("rooms");
} //switchroom

async function joinroom(user, room, pass, visibility) {
	exports.users.get(user).join(room, pass, visibility);
	await update("users");
	await update("rooms");
} //joinroom

async function addroom(room) {
	new classes.Room(room.name, room.pass, room.owner, room.visibility);
	await update("rooms");
} //addroom

async function rmuser(id) {
	exports.rooms.get("USR" + exports.users.get(id).name).delete();
	exports.users.get(id).quit();
	await update("users");
	await update("rooms");
} //rmuser


async function transmit(...data) {
	return await exports.ipc.in("ipc").volatile.emit(...data);
} //transmit

async function update(prop) {
	let params = /^(users|rooms)$/.test(prop) ? Array.from(exports[prop]) : exports[prop];
	return await transmit("update", prop, ...params);
} //update


function drop(line, t = 1) {
	line = line.split(' ');
	while (t--) {
		line.shift();
	}
	return line.join(' ');
} //drop

function dropGet(line, t = 0) {
	line = line.split(' ');
	while (t--) {
		line.shift();
	}
	return line.shift();
} //dropGet


async function syscall(execstring = "ls") {
	execstring = execstring.split(' ');

	let com = cp.spawn(execstring.shift(), execstring, {
		env: process.env,
		cwd: process.cwd(),
		shell: true
	});

	com.once("error", async err => {
		console.error(chalk.redBright(util.inspect(err)));
	});

	com.once("close", async code => {
		console.log(code ? chalk.yellow(code) : chalk.cyan(code));
	});

	com.stdout.pipe(process.stdout);
	com.stderr.pipe(process.stderr);

	return com;
} //syscall

//FUNCTIONS ^

exports.syscall = syscall;
exports.drop = drop;
exports.dropGet = dropGet;
exports.adduser = adduser;
exports.addroom = addroom;
exports.joinroom = joinroom;
exports.switchroom = switchroom;
exports.addmsg = addmsg;
exports.rmuser = rmuser;
exports.update = update;
exports.transmit = transmit;
exports.console = console;
