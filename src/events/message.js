
const getopts = require("getopts")
module.exports = async (client, logger, msg) => {
	return new Promise((resolve,reject) => {
		//ignore if bot
		if(msg.author.bot) return resolve();
		//split msg into []
		const args = msg.content.split(/\s+/g);
		if(args.length === 0) return resolve();
		if(/\s/.test(client.prefix)) args.shift(); //shift if prefix has space
		const command_name = /\s/.test(client.prefix) ? args.shift().toLowerCase() : args.shift().slice(client.prefix.length).toLowerCase();
		const cmd = client.commands.get(command_name) || client.commands.get(client.aliases.get(command_name));
		//only run if message starts with prefix, and command is found
		if(msg.content.startsWith(process.env.PREFIX) && cmd) {
			try {
				//parse arguments with getopts package (--flag)
				const flags_options = parseOptions(cmd.config.flags);
				const options = getopts(msg.cleanContent.split(/ +/g).slice(1), {
					boolean: flags_options.boolean,
					string: flags_options.string,
					alias: flags_options.aliases,
					default: flags_options.defaults
				})
				//show help message if flag: help, or no args & usageIfNotSet is true
				if(options.help || cmd.config.usageIfNotSet) {
					const help = client.commands.get('help').generateHelpCommand(client,cmd);
					return msg.channel.send(help)
				}
				const newArgs = options._;
				const _logger = new client.Logger(command_name,{type:'command'});
				//finally, run command and resolve promise
				cmd.run(client,msg,newArgs,options,_logger)
				resolve();
			}catch(err) {
				msg.channel.send('**Command Error**\n`' + err.stack + "`");
				reject(err);
			}
		}
	})
}

function parseOptions(flags = {}) {
	let result = {
		string:[],
		boolean:['help'],
		aliases:{help:'h'},
		misc:[],
		defaults:{
			help:false
		}
	}
	for(const key in flags) {
		if(!flags.hasOwnProperty(key)) continue;
		
		if(flags[key] === Boolean || flags[key] === "boolean") {
			result.boolean.push(key);
		}else if(Array.isArray(flags[key])) {
			//if alias option only includes 1 or less ignore
			if(flags[key].length <= 1) continue;
			result.aliases[flags[key][0]] = flags[key].slice(1)
		}else if(typeof(flags[key]) === "object") {
			/*
			{ type: Boolean, aliases: ['t','turbo'] }
			*/
			if(flags[key].type) {
				//again, if alias option only includes 0
				if(flags[key].type === Boolean || flags[key].type === "boolean") {
					//Push the first alias
					result.boolean.push(key)
					if(flags[key].aliases) result.aliases[key] = flags[key].aliases
					if(flags[key].default) result.defaults[key] = flags[key].default
				}else if(flags[key].type === String || flags[key].type === "string") {
					result.string.push(key)
					if(flags[key].aliases) result.aliases[key] = flags[key].aliases
					if(flags[key].default) result.defaults[key] = flags[key].default
				}
			} 
		} else{
			result.string.push(key);
		}
	}
	return result;
}