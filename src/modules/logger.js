const chalk = require('chalk');
module.exports = {
    config:{
        type:'internal'
    },
    Logger: class Logger {
        constructor(name,settings = {}) {
            let prefix;
            switch(settings.type){
                case "mod":
                case "module":
                    prefix = "mod/";
                    break;
                case "event":
                    prefix = "event/";
                    break;
                case "command":
                case "cmd":
                    prefix = "cmd/";
                    break;
            }
            this.mod = (prefix? prefix+name : name).toLowerCase();
        }

        log(...args) {
            console.log(`[${this.mod}] ${args.join(" ")}`)
        }

        warn(...args) {
            console.warn(chalk`[WARN::${this.mod}] {yellow ${args.join(" ")}}`)
        }
        error(...args) {
            console.error(chalk`[ERROR::${this.mod}] {red ${args.join(" ")}}`)
        }
        servere(...args) {
            console.error(chalk`[SEVERE::${this.mod}] {red ${args.join(" ")}}`)
            process.exit(1);
        }
        success(...args) {
            console.info(chalk`[${this.mod}] {green ${args.join(" ")}}`)
        }

        debug(...args) {
            //process.env.debug_level
            console.debug(`[DEBUG::${this.mod}] ${args.join(" ")}`)
        }

        info(...args) {
            console.info(`[INFO::${this.mod}] ${args.join(" ")}`)
        }
    }
}