const cluster = require("cluster"),
	os = require("os");

if (cluster.isMaster) {
	process.on("message", console.log);
	for (let i of os.cpus()) {
		let wk = cluster.fork();
		wk.once("online", () => wk.send("ok"));
	}
} else {
	process.on("message", msg => {
		process.send(msg);
		console.log("-");
	});
}
