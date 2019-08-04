
const getopts = require("getopts")
module.exports = async (client, logger, msg) => {
	return new Promise((resolve,reject) => {
		//ignore if bot
		if(msg.author.bot) return resolve();
		//credit to: https://stackoverflow.com/a/46946633, supports quotes to be taken as args
		const args = msg.content.match(/\\?.|^$/g).reduce((p, c) => {
			if(c === '"'){
				p.quote ^= 1;
			}else if(!p.quote && c === ' '){
				p.a.push('');
			}else{
				p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
			}
			return  p;
		}, {a: ['']}).a
		if(/^[A-Za-z0-9]+/.test(client.prefix)) args.shift(); //shift if need to use symbol based prefix
		const command_name = /^[A-Za-z0-9]+/.test(client.prefix) ? args.shift().toLowerCase() : args.shift().slice(client.prefix.length).toLowerCase();
		const cmd = client.commands.get(command_name) || client.commands.get(client.aliases.get(command_name));
		//only run if message starts with prefix, and command is found
		if(msg.content.startsWith(client.prefix) && cmd) {
			try {
				//parse arguments with getopts package (--flag)
				const flags_options = parseOptions(cmd.config.flags);
				const options = getopts(msg.cleanContent.split(/ +/g).slice(1), {
					boolean: flags_options.boolean,
					string: flags_options.string, //includes numbers
					alias: flags_options.aliases,
					default: flags_options.defaults
				})
				const newArgs = options._;
				let flags = {};
				//do a final process, parsing number flags as numbers from string, and removing aliases
				const names = Object.keys(flags_options.aliases).concat(flags_options.boolean,flags_options.string)
				for(const key in options) {
					if(key === "_") continue;
					//flags_options.number is object of default values
					if(!names.includes(key)) continue; //ignore aliases, dont use them
					if(flags_options.number[key] != null) {
						//use default if blank/null, otherwise parse
						if(!options[key] || options[key] == "") {
							flags[key] = flags_options.number[key];
						}else{
							flags[key] = parseInt(options[key]);
						}
					}else{
						flags[key] = options[key]
					}
				}
				//show help message if flag: help, or no args & usageIfNotSet is true
				if(options.help || (cmd.config.usageIfNotSet && newArgs.length == 0)) {
					const help = client.commands.get('help').generateHelpCommand(client,cmd);
					return msg.channel.send(help)
				}
				const _logger = new client.Logger(command_name,{type:'command'});
				//finally, run command and resolve promise
				cmd.run(client,msg,newArgs,options,_logger)
				resolve();
			}catch(err) {
				msg.channel.send('**Command Error**\n`' + err.stack + "`").catch(err => logger.warn("Failed to send command error message",err.message))
				reject(err);
			}
		}
	})
}

function parseOptions(flags = {}) {
	let result = {
		string:[],
		number:{},
		boolean:['help'],
		aliases:{help:'h'},
		defaults:{
			help:false
		}
	}
	for(const key in flags) {
		if(!flags.hasOwnProperty(key)) continue;
		if(typeof(flags[key]) === "object") {
			/*
			{ type: Boolean, aliases: ['t','turbo'] }
			*/
			if(flags[key].type) {
				//again, if alias option only includes 0
				if(flags[key].type === Boolean || (typeof value === "string" && flags[key].type === "boolean")) {
					//Push the first alias
					result.boolean.push(key)
					if(flags[key].default) result.defaults[key] = flags[key].default
				}else if(flags[key].type === String || flags[key].type === "string") {
					result.string.push(key)
					if(flags[key].default) result.defaults[key] = flags[key].default
				}else if(flags[key].type === Number || (typeof value === "string" && flags[key].type.toLowerCase() === "number")) {
					result.string.push(key);
					result.number[key] = flags[key].default;
				}
				if(flags[key].aliases) result.aliases[key] = flags[key].aliases
			} 
		}else if(flags[key] === Boolean || (typeof value === "string" && flags[key].toLowerCase() === "boolean")) {
			result.boolean.push(key);
			result.defaults[key] = false;
		}else if(flags[key] === Number || (typeof value === "string" && flags[key].toLowerCase() === "number")) {
			result.string.push(key);
			result.number[key] = 0;
		}else if(Array.isArray(flags[key])) {
			//if alias option only includes 1 or less ignore
			if(flags[key].length <= 1) continue;
			result.aliases[flags[key][0]] = flags[key].slice(1)
		}else {
			result.string.push(key);
		}
	}
	return result;
}

class Arguments {
	constructor(message,isWordPrefix = false) {
		this._text = message;
		this.slice_amount = isWordPrefix ? 1:2
	}
	getArgs() {
		return this._text.split(/\s+/).slice(this.slice_amount)
	}
	getFullArgs() {
		return this._text.match(/\\?.|^$/g).reduce((p, c) => {
			if(c === '"'){
				p.quote ^= 1;
			}else if(!p.quote && c === ' '){
				p.a.push('');
			}else{
				p.a[p.a.length-1] += c.replace(/\\(.)/,"$1");
			}
			return  p;
		}, {a: ['']}).slice(this.slice_amount);
	}
}