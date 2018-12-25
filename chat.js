/** @TODO
 * ADD MULTIPLE ROOMS, PROFILES AND BANS/REQUEST-TIMEOUT, MESSAGE HISTORY
 */


//FIRST-EXPANSION

const readline = exports.readline = require("readline"),
	cluster = exports.cluster = require("cluster"),
	os = exports.os = require("os"),
	chalk = exports.chalk = require("chalk"),
	util = exports.util = require("util"),
	cp = exports.cp = require("child_process"),
	fs = exports.fs = require("fs-extra"),
	strip = exports.stripAnsi = require("strip-ansi"),
	path = require("path"),
	socket = require("socket.io");

const config = exports.config = require("./configs/config.json"),
	classes = exports.classes = require("./src/classes.js"),
	yes = /^(ye?s?|ok|sure|true|affirmative)$/i;

//SECOND-EXPANSION

util.inspect.defaultOptions.getters = util.inspect.defaultOptions.sorted = util.inspect.defaultOptions.showHidden = true;
util.inspect.defaultOptions.depth = 3;
util.inspect.defaultOptions.maxArrayLength = 50;

for (let i in process.env) {
	config[i] = process.env[i];
}

exports.users = new Map();
exports.msgs = [ ];

const logs = exports.log = fs.createWriteStream(config.logfile, {
	flags: 'a+',
	mode: 0o750
});


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


let commands = exports.commands = {
	exit: new classes.Command('^' + config.prefix + "e(xit)?$", () => {
		exports.logs.write("Shutting Down... " + Date());
		process.exit();
		return true;
	}),
	quit: new classes.Command('^' + config.prefix + "q(uit)?$", () => {
		rl.close();
		console.info(chalk.bold("CLI disabled!"));
		return true;
	}),
	system: new classes.Command('^' + config.prefix + "s(ys(call)?)? .+$", line => syscall(drop(line))),
	restart: new classes.Command('^' + config.prefix + "r(e(s(tart)?|l(oad)?))?$", () => process.exit(1)),
	clear: new classes.Command('^' + config.prefix + "c(l(ea(r|n))?)?$", () => {
		readline.cursorTo(process.stdout, 0, 0);
		readline.clearScreenDown(process.stdout);
		return true;
	}),
	logs: new classes.Command('^' + config.prefix + "l(ogs?)?$", () => fs.createReadStream(config.logfile).pipe(process.stdout)),
	erase: new classes.Command('^' + config.prefix + "(erase|ers?)$", () => {
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
	say: new classes.Command('^' + config.prefix + "say .+? .+$", line => {
		return transmit("dispatchTo", dropGet(line, 1), "message", drop(drop(line)), "<font color='red'><b>ADMIN</b></font>");
	}),
	sayall: new classes.Command('^' + config.prefix + "sayall .+$", line => {
		return transmit("dispatch", "message", drop(line), "<font color='red'><b>ADMIN</b></font>");
	}),
	localeval: new classes.Command('^' + config.prefix + "e(v(al)?)? .+$", line => transmit("localeval", drop(line))),
	refresh: new classes.Command('^' + config.prefix + "ref(r(esh)?)?( .+)?$", line => {
		if (line.split(' ').length >= 2) {
			transmit("localeval", `if (nick == "${drop(line)}") {alert("Server commands you to Refresh.");location.reload()}`);
		} else {
			transmit("localeval", "alert('Server issued Refresh.');location.reload()");
		}
		return true;
	}),
	eval: new classes.Command('', line => console.log(chalk.gray(util.inspect(eval(line)))) || true)
};


if (cluster.isMaster) {
	require("./src/setup.js");
	exports.log.write("Server launched at " + Date() + '\n');

	const ipc = exports.ipc = socket({
		serveClient: false,
		path: "/ipc"
	});

	ipc.attach(config.ipcPort, {
		cookie: false
	});

	ipc.of("/ipc").on("connection", sock => {
		sock.once("auth", code => {
			if (code != config.ipcPass) {
				sock.emit("disallowed");
				sock.disconnect(true);
				return;
			}
			sock.join("ipc");
			sock.on("adduser", adduser);
			sock.on("rmuser", rmuser);
			sock.on("addmsg", addmsg);
			sock.on("dispatch", (...data) => ipc.of("/ipc").in("ipc").volatile.emit("dispatch", ...data));
			sock.emit("ok");
		});
	});

	for (let cpu of os.cpus()) {
		cluster.fork();
	}

	let rl = exports.rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	exports.compiling = false;

	rl.on("line", exports.rlline = line => {
		exports.log.write(`Issued: '${line}' at ${Date()}\n`);

		for (let i in commands) {
			if (commands[i].test(line)) {
				return;
			}
		}

		console.info("Command not Found");
	});

	exports.watcherroot = fs.watch(__dirname, {
		persistent: false
	}, (evt, file) => {
		if (file.startsWith("babel") && !exports.compiling) {
			syscall("npm run build").once("close", () => exports.compiling = false);
			exports.compiling = true;
		} else if (file.endsWith(".js")) {
			exports.rlline(".reload");
		}
	});

	exports.watchersrc = fs.watch(path.join(__dirname, "src"), {
		persistent: false
	}, (evt, file) => {
		if (file.endsWith(".js")) {
			exports.rlline(".reload");
		}
	});

	exports.watcherclient = fs.watch(config.localpath, {
		persistent: false,
		recursive: true
	}, (evt, file) => {
		if (file.startsWith("JS" + path.sep) && file.endsWith(".js") && !exports.compiling) {
			syscall("npm run build").once("close", () => exports.compiling = false);
			exports.compiling = true;
		}
		});

	process.once("exit", code => {
		console.info(chalk.cyan(code));
		exports.log.write("Master exited at '" + Date() + `' with ${code}\n`);
	});
} else {
	require("./src/serve.js");
}


process.on("uncaughtException", err => {
	console.error(chalk.red(util.inspect(err)));
});

process.on("unhandledRejection", err => {
	console.error(chalk.redBright(util.inspect(err)));
});


function transmit(...data) {
	return exports.ipc.of("/ipc").to("ipc").volatile.emit(...data);
} //transmit

function addmsg(msg) {
	exports.msgs.push([msg.user, msg.msg]);
	while (exports.msgs.length > config.maxMsgs) {
		exports.msgs.shift();
	}
	update("msgs");
} //addmsg

function adduser(user) {
	exports.users.set(user.id, user.nick);
	update("users");
} //adduser

function rmuser(id) {
	exports.users.delete(id);
	update("users");
} //rmuser

function update(prop) {
	let params = prop == "users" ? Array.from(exports[prop]) : exports[prop];
	return exports.ipc.of("/ipc").to("ipc").volatile.emit("update", prop, ...params);
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


function syscall(execstring = "ls") {
	execstring = execstring.split(' ');

	let com = cp.spawn(execstring.shift(), execstring, {
		env: process.env,
		cwd: process.cwd(),
		shell: true
	});

	com.once("error", err => {
		console.error(chalk.redBright(util.inspect(err)));
	});

	com.once("close", code => {
		console.log(code ? chalk.yellow(code) : chalk.cyan(code));
	});

	com.stdout.pipe(process.stdout);
	com.stderr.pipe(process.stderr);

	return com;
} //syscall

exports.syscall = syscall;
exports.drop = drop;
exports.dropGet = dropGet;
exports.adduser = adduser;
exports.rmuser = rmuser;
exports.update = update;
