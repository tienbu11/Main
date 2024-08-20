const { spawn } = require("child_process");
const { readFileSync } = require("fs-extra");
const http = require("http");
const axios = require("axios");
const semver = require("semver");
const logger = require("./utils/log");

/////////////////////////////////////////////
//========= Check node.js version =========//
/////////////////////////////////////////////

// const nodeVersion = semver.parse(process.version);
// if (nodeVersion.major < 13) {
//     logger(`Your Node.js ${process.version} is not supported, it required Node.js 13 to run bot!`, "error");
//     return process.exit(0);
// };

///////////////////////////////////////////////////////////
//========= Create website for dashboard/uptime =========//
///////////////////////////////////////////////////////////

const app = require("express")();
    app.set('port', (process.env.PORT || 8888 ));
    app.get('/', function(request, response) {
        var result = 'Hello Admin Q.Huy'
        response.send(result);
  }).listen(app.get('port'));


logger("Opened server site...", "[ Starting ]");

/////////////////////////////////////////////////////////
//========= Create start bot and make it loop =========//
/////////////////////////////////////////////////////////

function startBot(message) {
    (message) ? logger(message, "[ Starting ]") : "";

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "mirai.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot("Restarting...");
            global.countRestart += 1;
            return;
        } else return;
    });

    child.on("error", function (error) {
        logger("An error occurred: " + JSON.stringify(error), "[ Starting ]");
    });
};
////////////////////////////////////////////////
//========= Check update from Github =========//
////////////////////////////////////////////////
const chalk = require('chalkercli');
const chalk2 = require("chalk");

axios.get("https://raw.githubusercontent.com/d-jukie/miraiv2/main/package.json").then((res) => {
    logger(res['data']['name'], "[ Bypass ]");
    logger("Version: " + res['data']['version'], "[ Phiên Bản ]");
    logger(res['data']['description'], "[ DESCRIPTION ]");
});

 const rainbow = chalk.rainbow(`
░░░░░███████ ]▄▄▄▄▄▄▄▄▃
  ▂▄▅█████████▅▄▃▂
I███████████████████].
  ◥⊙▲⊙▲⊙▲⊙▲⊙▲⊙▲⊙◤...

 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`).stop();

rainbow.render();
const frame = rainbow.frame();
console.log(frame)
startBot();
// THIZ BOT WAS MADE BY ME(CATALIZCS) AND MY BROTHER SPERMLORD - DO NOT STEAL MY CODE (つ ͡ ° ͜ʖ ͡° )つ ✄ ╰⋃╯