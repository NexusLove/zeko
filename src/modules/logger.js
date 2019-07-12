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
            const module_name = prefix? prefix+name : name
            this.mod = module_name.toLowerCase();
        }

        log(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            console.log(`[${date}] [${this.mod}] ${args.join(" ")}`)
        }

        warn(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            console.warn(chalk`[${date}] [WARN::${this.mod}] {yellow ${args.join(" ")}}`)
        }
        error(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            console.error(chalk`[${date}] [ERROR::${this.mod}] {red ${args.join(" ")}}`)
        }
        servere(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            console.error(chalk`[${date}] [SEVERE::${this.mod}] {red ${args.join(" ")}}`)
            process.exit(1);
        }
        success(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            console.info(chalk`[${date}] [${this.mod}] {green ${args.join(" ")}}`)
        }

        debug(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            if(process.env.LOGGER_DEBUG_LEVEL > 0) {
                console.debug(`[${date}] [DEBUG::${this.mod}] ${args.join(" ")}`)
            }
        }

        info(...args) {
            const date = new Date().toLocaleTimeString('en-US', {hour12:false})
            console.info(`[${date}] [INFO::${this.mod}] ${args.join(" ")}`)
        }
    }
}
function fileWrite(text) {
}