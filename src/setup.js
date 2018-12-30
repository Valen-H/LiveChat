"use strict";

const fs = require("fs-extra"),
	chalk = require("chalk"),
	path = require("path");

const config = module.parent.exports.config;

function check() {
	fs.ensureDirSync(path.join(config.localpath, "/JS"));
	fs.ensureDirSync(path.join(config.localpath, "/JS5"));
	fs.ensureDirSync(path.join(config.localpath, "/CSS"));
	fs.ensureDirSync(path.join(config.localpath, "/dist"));

	let targ = path.join(config.localpath, "/JS5/polyfill.min.js");

	if (!fs.existsSync(targ)) {
		fs.copyFileSync("node_modules/babel-polyfill/dist/polyfill.min.js", targ, fs.constants.COPYFILE_EXCL | fs.constants.COPYFILE_FICLONE);
		console.info(chalk`{gray Created file: ${config.localpath}/JS5/polyfill.min.js}`);
	}
} //check

check();
